import crypto from "crypto";
import "dotenv/config";
import mime from "mime-types";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import Mailgun from "mailgun.js";
import formData from "form-data";

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

  const authTag = cipher.getAuthTag();

  // Store all 3. You can:
  // (A) store them in 3 columns, OR
  // (B) pack them in one string.
  // Option B (compact):
  const payload = Buffer.concat([iv, authTag, encrypted]).toString("base64");

  return {
    payload, // save this in DB
    iv: iv.toString("base64"),
    tag: authTag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}

export function decryptPII(payloadB64: string): string {
  try {
    if (PII_KEY.length !== 32) {
      throw new Error(
        "PII_ENC_KEY must be a 32-byte key (base64 decode length != 32)",
      );
    }
    const raw = Buffer.from(payloadB64, "base64");

    const iv = raw.subarray(0, 12); // first 12 bytes
    const authTag = raw.subarray(12, 28); // next 16 bytes
    const ciphertext = raw.subarray(28); // rest

    const decipher = crypto.createDecipheriv(ALGO, PII_KEY, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(), // <-- error happens here when something doesn't match
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    throw new Error("Decryption failed for payload: " + payloadB64);
  }
}

export function hashForLookup(value: string) {
  const hmacKey = Buffer.from(process.env.PII_LOOKUP_KEY!, "base64"); // DIFFERENT KEY from PII_ENC_KEY
  return crypto
    .createHmac("sha256", hmacKey)
    .update(value.toLowerCase().trim())
    .digest(); // Buffer(32)
}

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

export const uploadFileToS3 = async (
  file: any,
  folder: string,
  fileName: string,
) => {
  const fileMimeType =
    mime.lookup(file.originalname) || "application/octet-stream";
  const fileKey = `${folder}/${fileName}-${uuidv4()}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME || "",
    Key: fileKey,
    Body: file.buffer,
    ContentType: fileMimeType,
    ContentDisposition: "inline",
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // S3 URL of the uploaded file
  } catch (error: any) {
    throw new Error("File upload to S3 failed: " + error.message);
  }
};

export const deleteFileFromS3 = async (fileKey: string) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME || "",
    Key: fileKey,
  };

  try {
    await s3.deleteObject(params).promise();
    return { success: true, message: "File successfully deleted from S3" };
  } catch (error: any) {
    throw new Error("File deletion from S3 failed: " + error.message);
  }
};

// export const sendFirebaseMessage = async (
//   tokens: any,
//   message_body: any,
//   message_title: any,
// ) => {
//   try {
//     const response = await getMessaging().sendEachForMulticast({
//       notification: {
//         title: message_title,
//         body: message_body,
//       },
//       tokens: tokens,
//     });
//     if (response.failureCount > 0) {
//       console.log(
//         "Firebase messaging error" +
//           response.responses.find((error) => error == null),
//       );
//     }
//   } catch (error) {
//     console.log("error in util function sendFirebaseMessage");
//     throw error;
//   }
// };

export const getPositionSuffixOfNumber = (number: number) => {
  if (number % 10 == 1) {
    return "st";
  } else if (number % 10 == 2) {
    return "nd";
  } else if (number % 10 == 3) {
    return "rd";
  } else {
    return "th";
  }
};

export const sendEmailUsingMailGun = async (
  template_name: any,
  template_variables: any,
  to_emails: string[] | undefined,
  from_email: string | undefined,
) => {
  if (process.env.IS_EMAILS_ENABLED === "true") {
    try {
      console.log("Sending email using MailGun to:", to_emails);
      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: "api",
        key: process.env.MAILGUN_API_KEY!,
        // url: "https://api.eu.mailgun.net",
      });
      mg.messages.create("mail.qubico.in", {
        from: from_email,
        to: to_emails,
        template: template_name,
        "t:variables": template_variables,
      });
    } catch (error: any) {
      console.log("error in sendEmailUsingMailGun", error);
      // throw error;
    }
  }
};
