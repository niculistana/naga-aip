import type { Request, Response, NextFunction } from "express";

import { ssrHandlerPromise } from "../../middleware/ssr/index.js";

export const getAppBundle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const reactRouterRequestHandler = await ssrHandlerPromise();
  if (reactRouterRequestHandler) {
    return reactRouterRequestHandler(req, res, next);
  }

  return res.status(404).send({ message: "Not found" });
};
