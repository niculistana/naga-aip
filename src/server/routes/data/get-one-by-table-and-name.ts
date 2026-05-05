import type { Request, Response, NextFunction } from "express";

import { allowedTables } from "../../util.js";
import { allowedFields } from "../../util.js";
import type NodeCache from "node-cache";

export const getOneByTableAndName =
  (sql: any, cache: NodeCache) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const table = req.params.table;
    const name = req.params.name;
    const fields = req.query.fields;

    if (!table?.length || !allowedTables.includes(table.toString())) {
      return res.status(400).json({
        message: "Invalid table, please see GET /api/tables for valid tables",
      });
    }

    if (!fields?.length) {
      return res
        .status(400)
        .json({ message: "Fields query params are are required" });
    }

    const filterParams = (str: string) => allowedFields.includes(str);
    const safeFields = fields.toString().split(",").filter(filterParams);
    const safeFieldsStr = safeFields.join(", ");

    let message = `This API may be missing data which we are actively looking to add to, please file a request on Github to prioritize it.`;
    if (safeFields.length !== fields.toString().split(",").length) {
      message += `. Some fields were filtered out, please see GET /api/fields/${table} for valid fields for ${table}`;
    }

    if (!safeFields?.length) {
      return res.status(400).json({ message: "Bad request" });
    }

    const cacheKey = `one-${table}-${name}-${safeFieldsStr}`;
    if (cache.has(cacheKey)) {
      const cachedResult = cache.get(cacheKey);
      return res.status(200).json({ result: cachedResult, message });
    }

    let result = {};

    try {
      result =
        await sql`SELECT ${sql.unsafe(safeFieldsStr)} from ${sql.unsafe(table)} where name = ${name}`;
      cache.set(cacheKey, result);
    } catch (e) {
      return res.status(500).json({
        message: "Internal server error",
        params: req.params,
        query: req.query,
      });
    }

    return res.status(200).json({ result, message });
  };
