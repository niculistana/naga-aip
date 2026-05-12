import type { Request, Response, NextFunction } from "express";
import type NodeCache from "node-cache";
import type { DBClient } from "../../db/db-client.js";
import { disclaimerMessage } from "../../util.js";

export const getSectorsFromClusters =
  (db: DBClient, cache: NodeCache) =>
  async (_req: Request, res: Response, _next: NextFunction) => {
      const table = "clusters";
      const safeFields = ["id", "name", "year"];
      const safeFieldsStr = safeFields.join(", ");

      const message = disclaimerMessage;

      const cacheKey = `all-${table}-${safeFieldsStr}`;
      if (cache.has(cacheKey)) {
        const cachedResult = cache.get(cacheKey);
        return res.status(200).json({ result: cachedResult, message });
      }

      let result = {};

      try {
        result = await db.getAllByTable(table, safeFields);
        cache.set(cacheKey, result);
      } catch (e) {
        console.log(e);
        return res.status(500).json({
          message: "Internal server error",
        });
      }

      return res.status(200).json({ result, message });
  };
