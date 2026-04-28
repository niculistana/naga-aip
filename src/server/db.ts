import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env"),
});
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL || "");
