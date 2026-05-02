import type { NextFunction, Response, Request } from "express";
import { allowedTables } from "../../util.js";
export const getAllTables = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.json(allowedTables);
};
