import admin from "firebase-admin";
import "dotenv/config";

const service_account_json = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!service_account_json) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT env var is required");
}

const service_account = JSON.parse(service_account_json);

admin.initializeApp({
  credential: admin.credential.cert(service_account),
});

export default admin;
