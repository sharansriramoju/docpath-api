import crypto from "crypto";
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
