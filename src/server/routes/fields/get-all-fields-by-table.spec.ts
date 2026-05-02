import { describe, it, vi, expect } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { getAllFieldsByTable } from "./get-all-fields-by-table.js";
import { getAllowedFieldsForTable, allowedTables } from "../../util.js";

const createMockReqRes = (table = "clusters") => {
  const req = {
    params: { table },
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;

  return { req, res, next };
};

describe("getAllFieldsByTable", () => {
  it("returns 400 if table is invalid", () => {
    const { req, res, next } = createMockReqRes("invalid_table");

    getAllFieldsByTable(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid table, please see GET /api/tables for valid tables",
    });
  });

  it("returns allowed fields for a valid table", () => {
    const table = allowedTables[0];
    const { req, res, next } = createMockReqRes(table);

    getAllFieldsByTable(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(getAllowedFieldsForTable(table));
  });
});
