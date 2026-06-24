import "dotenv/config";

// Role id of the seeded "Patient" role. Sourced from the environment so it can
// be tuned per deployment; falls back to 3 (the value seeded in 0001-roles).
export const PATIENT_ROLE_ID = Number(process.env.PATIENT_ROLE_ID ?? 3);
