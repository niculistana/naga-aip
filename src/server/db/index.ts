import dotenv from "dotenv";
import path from "path";
import { SERVER_BASE_PATH_FROM_ROOT } from "../util.js";
dotenv.config({
  path: path.resolve(
    import.meta.dirname,
    `${SERVER_BASE_PATH_FROM_ROOT}/../.env`,
  ),
});
import { neon } from "@neondatabase/serverless";
const DATABASE_URL = process.env.DATABASE_URL;
export const sql = neon(DATABASE_URL || "");
