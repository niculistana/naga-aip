import type { Request, Response, NextFunction } from "express";
import type NodeCache from "node-cache";
import type { DBClient } from "../../db/db-client.js";
import {
  getImplementationStatus,
  type ImplementationStatus,
} from "./hardcode/programs.js";
import { disclaimerMessage } from "../../util.js";
import {
  programFactory,
  type FactoryProgram,
} from "../factory/program.factory.js";

export type Program = {
  program_id: number;
  name: string;
  implementation_status: ImplementationStatus;
};

export type DBProgram = {
  id: number;
  name: string;
  implementation_start: string;
  implementation_end: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const getProgramsFromRawPrograms =
  (db: DBClient, cache: NodeCache) =>
  async (req: Request, res: Response, _next: NextFunction) => {
    const table = "programs";
    const safeFields = [
      "id",
      "name",
      "implementation_start",
      "implementation_end",
    ];
    const safeFieldsStr = safeFields.join(", ");

    const message = disclaimerMessage;

    // Parse and validate pagination params
    const page = Math.max(
      1,
      parseInt(req.query.page as string) || DEFAULT_PAGE,
    );
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.page_size as string) || DEFAULT_PAGE_SIZE),
    );
    const offset = (page - 1) * pageSize;

    const cacheKey = `all-${table}-${safeFieldsStr}`;

    let allResults: Program[];

    if (cache.has(cacheKey)) {
      allResults = cache.get(cacheKey) as Program[];
    } else {
      let dbResult: DBProgram[] = [];

      try {
        dbResult = (await db.getAllByTable(table, safeFields)) as DBProgram[];

        allResults = dbResult
          .map((item: DBProgram) => programFactory.transient(item).build())
          .filter(Boolean) as Program[];

        cache.set(cacheKey, allResults);
      } catch (e) {
        return res.status(500).json({
          message: "Internal server error",
        });
      }
    }

    const totalItems = allResults.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const result = allResults.slice(offset, offset + pageSize);

    return res.status(200).json({
      result,
      pagination: {
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
      message,
    });
  };
