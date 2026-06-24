import crypto from "crypto";
import AWS from "aws-sdk";
import "dotenv/config";

const ALGO = "aes-256-gcm";
const PII_KEY = Buffer.from(process.env.PII_ENC_KEY!, "base64");
export function encryptPII(plaintext: string) {
  // 12-byte IV (nonce) is recommended for GCM
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGO, PII_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const auth_tag = cipher.getAuthTag();

  // Store all 3. You can:
  // (A) store them in 3 columns, OR
  // (B) pack them in one string.
  // Option B (compact):
  const payload = Buffer.concat([iv, auth_tag, encrypted]).toString("base64");

  return {
    payload, // save this in DB
    iv: iv.toString("base64"),
    tag: auth_tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}

export function decryptPII(payload_b64: string): string {
  try {
    if (PII_KEY.length !== 32) {
      throw new Error(
        "PII_ENC_KEY must be a 32-byte key (base64 decode length != 32)",
      );
    }
    const raw = Buffer.from(payload_b64, "base64");

    const iv = raw.subarray(0, 12); // first 12 bytes
    const auth_tag = raw.subarray(12, 28); // next 16 bytes
    const ciphertext = raw.subarray(28); // rest

    const decipher = crypto.createDecipheriv(ALGO, PII_KEY, iv);
    decipher.setAuthTag(auth_tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(), // <-- error happens here when something doesn't match
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    throw new Error("Decryption failed for payload: " + payload_b64);
  }
}

export function hashForLookup(value: string) {
  const hmac_key = Buffer.from(process.env.PII_LOOKUP_KEY!, "base64"); // DIFFERENT KEY from PII_ENC_KEY
  return crypto
    .createHmac("sha256", hmac_key)
    .update(value.toLowerCase().trim())
    .digest(); // Buffer(32)
}

// --- Blind index for partial (substring) search over encrypted names --- //

const TRIGRAM_SIZE = 3;
// Truncate each blind-index hash to 64 bits. This shrinks the stored array and
// the GIN index ~4x; truncation only risks rare extra false positives, which
// trigram search already tolerates. (Exact phone/email lookups use the full
// hashForLookup digest and are unaffected.)
const SEARCH_INDEX_HASH_LENGTH = 16;

const hmac_hex = (value: string): string => {
  const hmac_key = Buffer.from(process.env.PII_LOOKUP_KEY!, "base64");
  return crypto
    .createHmac("sha256", hmac_key)
    .update(value)
    .digest("hex")
    .slice(0, SEARCH_INDEX_HASH_LENGTH);
};

// Normalize a value to a single lowercase token (whitespace removed) and split
// it into overlapping trigrams. Trigram containment lets us match an arbitrary
// substring (>= 3 chars) of the original value.
const trigrams = (value: string): string[] => {
  const normalized = value.toLowerCase().replace(/\s+/g, "");
  const grams: string[] = [];
  for (let i = 0; i + TRIGRAM_SIZE <= normalized.length; i++) {
    grams.push(normalized.slice(i, i + TRIGRAM_SIZE));
  }
  return grams;
};

// Build the trigram blind-index terms for a name, stored alongside the
// encrypted value so the name can be substring-searched without decrypting it.
export const buildNameSearchIndex = (name: string): string[] => {
  const terms = new Set<string>();
  for (const gram of trigrams(name)) {
    terms.add(hmac_hex(gram));
  }
  return [...terms];
};

// Hash the query's trigrams for matching against a stored index. Queries
// shorter than the trigram size produce no terms.
export const hashNameSearchTerms = (query: string): string[] => {
  const terms = new Set<string>();
  for (const gram of trigrams(query)) {
    terms.add(hmac_hex(gram));
  }
  return [...terms];
};

// --- S3 file upload --- //

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const S3_BUCKET = process.env.S3_BUCKET_NAME!;

export async function uploadFileToS3(
  file: Express.Multer.File,
  folder?: string,
): Promise<{ url: string; key: string }> {
  const key = folder
    ? `${folder}/${Date.now()}-${file.originalname}`
    : `${Date.now()}-${file.originalname}`;

  const params: AWS.S3.PutObjectRequest = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();

  return {
    url: data.Location,
    key,
  };
}

export async function deleteFileFromS3(key: string): Promise<void> {
  await s3.deleteObject({ Bucket: S3_BUCKET, Key: key }).promise();
}
