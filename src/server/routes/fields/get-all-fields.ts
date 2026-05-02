import type { NextFunction, Response, Request } from "express";
import { allowedFields } from "../../util.js";

export const getAllFields = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.json(allowedFields);
};
