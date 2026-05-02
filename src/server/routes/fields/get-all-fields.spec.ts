import { describe, it, vi, expect } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { getAllFields } from "./get-all-fields.js";
import { allowedFields } from "../../util.js";

const createMockReqRes = () => {
  const req = {} as Request;
  const res = {
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;

  return { req, res, next };
};

describe("getAllFields", () => {
  it("returns all allowed fields", () => {
    const { req, res, next } = createMockReqRes();

    getAllFields(req, res, next);

    expect(res.json).toHaveBeenCalledWith(allowedFields);
  });
});
