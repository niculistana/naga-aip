import { sql } from "./index.js";
import { coerceNumericFields } from "../util.js";

export type Row = Record<string, unknown>;

const buildSafeFieldsStr = (fields: string[]) => fields.join(", ");

export const dbClient = {
  getAllByTable: async (table: string, fields: string[]): Promise<Row[]> => {
    const safeFieldsStr = buildSafeFieldsStr(fields);
    const rawResult =
      await sql`SELECT ${sql.unsafe(safeFieldsStr)} from ${sql.unsafe(table)}`;
    return coerceNumericFields(table, rawResult) as Row[];
  },

  getOneByTableAndId: async (
    table: string,
    fields: string[],
    id: string,
  ): Promise<Row[]> => {
    const safeFieldsStr = buildSafeFieldsStr(fields);
    const rawResult =
      await sql`SELECT ${sql.unsafe(safeFieldsStr)} from ${sql.unsafe(table)} where id = ${id}`;
    return coerceNumericFields(table, rawResult) as Row[];
  },

  getOneByTableAndName: async (
    table: string,
    fields: string[],
    name: string,
  ): Promise<Row[]> => {
    const safeFieldsStr = buildSafeFieldsStr(fields);
    const rawResult =
      await sql`SELECT ${sql.unsafe(safeFieldsStr)} from ${sql.unsafe(table)} where name = ${name}`;
    return coerceNumericFields(table, rawResult) as Row[];
  },
};

export type DBClient = typeof dbClient;
