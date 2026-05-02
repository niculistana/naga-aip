import { describe, it, vi, expect } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { getAllTables } from "./get-all-tables.js";
import { allowedTables } from "../../util.js";

const createMockReqRes = () => {
  const req = {} as Request;
  const res = {
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;

  return { req, res, next };
};

describe("getAllTables", () => {
  it("returns all allowed tables", () => {
    const { req, res, next } = createMockReqRes();

    getAllTables(req, res, next);

    expect(res.json).toHaveBeenCalledWith(allowedTables);
  });
});
