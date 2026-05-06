import dotenv from "dotenv";
import path from "path";
import { SERVER_BASE_PATH_FROM_ROOT } from "../util.js";
import { neon, types as pgTypes } from "@neondatabase/serverless";

dotenv.config({
  path: path.resolve(
    import.meta.dirname,
    `${SERVER_BASE_PATH_FROM_ROOT}/../.env`,
  ),
});

const DATABASE_URL = process.env.DATABASE_URL;

const getTypeParser: typeof pgTypes.getTypeParser = (oid, format) => {
  const defaultParser = pgTypes.getTypeParser(oid, format);

  if (oid === pgTypes.builtins.NUMERIC) {
    return (value: string) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : value;
    };
  }

  if (oid === pgTypes.builtins.INT8) {
    return (value: string) => {
      const parsed = Number(value);
      return Number.isSafeInteger(parsed) ? parsed : value;
    };
  }

  return defaultParser;
};

export const sql = neon(DATABASE_URL || "", {
  types: {
    getTypeParser,
  },
});
