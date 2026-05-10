import type { Request, Response, NextFunction } from "express";
import type NodeCache from "node-cache";
import type { DBClient } from "../../db/db-client.js";
import { Factory } from "fishery";
import { disclaimerMessage } from "../../util.js";

type Agency = {
  cluster_id: string;
  abbreviation: string;
  year: string;
};

type DBAgency = {
  cluster_id: number;
  abbreviation: string;
  year: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const getUnitsFromRawAgencies =
  (db: DBClient, cache: NodeCache) =>
  async (req: Request, res: Response, _next: NextFunction) => {
    const table = "agencies";
    const safeFields = ["cluster_id", "abbreviation", "year"];
    const safeFieldsStr = safeFields.join(", ");

    const message = disclaimerMessage;

    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.page_size as string) || DEFAULT_PAGE_SIZE));
    const offset = (page - 1) * pageSize;

    const cacheKey = `all-${table}-${safeFieldsStr}`;

    let allResults: Agency[];

    if (cache.has(cacheKey)) {
      allResults = cache.get(cacheKey) as Agency[];
    } else {
      let dbResult: DBAgency[] = [];

      try {
        dbResult = (await db.getAllByTable(table, safeFields)) as DBAgency[];

        const agencyFactory = Factory.define<Agency, DBAgency>(
          ({ transientParams }) => {
            return {
              cluster_id: String(transientParams.cluster_id),
              abbreviation: transientParams.abbreviation,
              year: String(transientParams.year),
            };
          },
        );

        allResults = dbResult.map((item) =>
          agencyFactory.build({}, { transient: item }),
        );
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