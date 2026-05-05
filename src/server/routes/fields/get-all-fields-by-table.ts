import type { NextFunction, Response, Request } from "express";
import { allowedTables } from "../../util.js";

import { getAllowedFieldsForTable } from "../../util.js";

export const getAllFieldsByTable = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const table = req.params.table.toString();

  if (!table?.length || !allowedTables.includes(table.toString())) {
    return res.status(400).json({
      message: "Invalid table, please see GET /api/tables for valid tables",
    });
  }

  const allowedFields = getAllowedFieldsForTable(table);

  return res.json(allowedFields);
};
