import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env"),
});

import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export const auth = betterAuth({
  trustedOrigins: [],
  advanced: {
    disableOriginCheck: process.env.NODE_ENV === "development" ? true : false,
  },
  database: pool,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(`Click the link to verify your email: ${url}`);
    },
  },
  onPasswordReset: async ({ user }, request) => {
    // your logic here
    console.log(`Password for user ${user.email} has been reset.`);
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
  },
});
