import { describe, it, beforeEach, vi, expect } from "vitest";
import { getPageData } from "./get-page-data.js";
import type { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";

const cache = new NodeCache();

const createMockReqRes = () => {
  const req = {} as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
};

describe("getPageData", () => {
  beforeEach(() => {
    cache.flushAll();
    vi.clearAllMocks();
  });

  it("returns 200 with page data and caches the result", async () => {
    const { req, res, next } = createMockReqRes();

    const mockDb: any = {
      getAllByTable: vi
        .fn()
        .mockResolvedValueOnce([
          {
            id: 1,
            name: "Sample Agency",
            abbreviation: "SA",
            cluster_id: 5,
            year: 2026,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 10,
            name: "Sample Program",
            agency_id: 1,
            implementation_start: "2026-01-01",
            implementation_end: "2026-12-31",
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 100,
            amount: 100,
            category: "Personal Services (PS) (9)",
            program_id: 10,
          },
          {
            id: 101,
            amount: 50,
            category: "Maintenance and Other Operating Expenses (MOOE) (10)",
            program_id: 10,
          },
          {
            id: 102,
            amount: 25,
            category: "Capital Outlay (CO) (11)",
            program_id: 10,
          },
        ]),
    };

    await getPageData(mockDb, cache)(req, res, next);

    expect(mockDb.getAllByTable).toHaveBeenNthCalledWith(1, "agencies", [
      "id",
      "abbreviation",
      "cluster_id",
      "year",
    ]);
    expect(mockDb.getAllByTable).toHaveBeenNthCalledWith(2, "programs", [
      "id",
      "name",
      "agency_id",
      "implementation_start",
      "implementation_end",
    ]);
    expect(mockDb.getAllByTable).toHaveBeenNthCalledWith(3, "amounts", [
      "id",
      "amount",
      "category",
      "program_id",
    ]);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.message).toEqual(expect.any(String));
    expect(jsonCall.result).toMatchObject({
      metadata: expect.any(Object),
      data_quality: expect.any(Object),
      sectors: expect.any(Array),
    });
    expect(jsonCall.result.sectors).toHaveLength(8);
    expect(jsonCall.result.rollup).toMatchObject({
      ps: 100,
      mooe: 50,
      co: 25,
      total: 175,
    });

    expect(cache.has("page-data")).toBe(true);
  });
});
