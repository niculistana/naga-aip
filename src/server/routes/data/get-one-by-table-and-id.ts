import path from "path";
import dotenv from "dotenv";
dotenv.config({
  path: path.resolve(import.meta.dirname, "../../../../.env"),
});

import { allowedFields } from "../util";
import type NodeCache from "node-cache";

export const getOneByTableAndId =
  (sql, cache: NodeCache) => async (req, res, next) => {
    const table = req.params.table;
    const id = req.params.id;
    const fields = req.query.fields;

    if (!fields?.length) {
      return res
        .status(400)
        .json({ message: "Fields query params are are required" });
    }

    const filterParams = (str: string) => allowedFields.includes(str);
    const safeFields = fields.toString().split(",").filter(filterParams);
    const safeFieldsStr = safeFields.join(", ");

    if (!safeFields?.length) {
      return res.status(400).json({ message: "Bad request" });
    }

    const cacheKey = `one-${table}-${id}-${safeFieldsStr}`;
    if (cache.has(cacheKey)) {
      const cachedResult = cache.get(cacheKey);
      return res.status(200).json({ result: cachedResult });
    }

    let result = {};

    try {
      result =
        await sql`SELECT ${sql.unsafe(safeFieldsStr)} from ${sql.unsafe(table)} where id = ${id}`;
      cache.set(cacheKey, result);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error",
        params: req.params,
        query: req.query,
      });
    }

    return res.status(200).json({ result });
  };
