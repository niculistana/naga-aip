import { describe, it, beforeEach, vi, expect } from "vitest";
import { getUnitsFromRawAgencies } from "./get-units-from-raw-agencies.js";
import type { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";

const cache = new NodeCache();

const CACHE_KEY = "all-agencies-cluster_id, abbreviation, year";

const createMockReqRes = (query: Record<string, string> = {}) => {
  const req = { query } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
};

const makeDbAgencies = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    cluster_id: i + 1,
    abbreviation: `AGY${i + 1}`,
    year: 2020 + i,
  }));

describe("getUnitsFromRawAgencies", () => {
  beforeEach(() => {
    cache.flushAll();
    vi.clearAllMocks();
  });

  it("returns 200 with default pagination when no query params provided", async () => {
    const { req, res, next } = createMockReqRes();
    const fakeDbResult = makeDbAgencies(3);
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.pagination).toMatchObject({
      page: 1,
      page_size: 20,
      total_items: 3,
      total_pages: 1,
      has_next_page: false,
      has_prev_page: false,
    });
    expect(jsonCall.result).toHaveLength(3);
    expect(jsonCall.message).toEqual(expect.any(String));
  });

  it("maps DB rows to Agency shape with stringified cluster_id and year", async () => {
    const { req, res, next } = createMockReqRes();
    const fakeDbResult = [{ cluster_id: 7, abbreviation: "DSWD", year: 2023 }];
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.result[0]).toEqual({
      cluster_id: "7",
      abbreviation: "DSWD",
      year: "2023",
    });
  });

  it("caches the mapped result after the first DB call", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(makeDbAgencies(2)),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    const cached = cache.get(CACHE_KEY) as any[];
    expect(cached).toHaveLength(2);
    expect(cached[0]).toMatchObject({
      cluster_id: "1",
      abbreviation: "AGY1",
      year: "2020",
    });
  });

  it("returns cached result and skips DB call on second request", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(makeDbAgencies(2)),
    };

    // First call — populates cache
    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);
    expect(mockDb.getAllByTable).toHaveBeenCalledTimes(1);

    // Second call — should use cache
    const { req: req2, res: res2, next: next2 } = createMockReqRes();
    await getUnitsFromRawAgencies(mockDb, cache)(req2, res2, next2);
    expect(mockDb.getAllByTable).toHaveBeenCalledTimes(1);
    expect(res2.status).toHaveBeenCalledWith(200);
  });

  it("respects page and page_size query params", async () => {
    const { req, res, next } = createMockReqRes({ page: "2", page_size: "2" });
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(makeDbAgencies(5)),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.pagination).toMatchObject({
      page: 2,
      page_size: 2,
      total_items: 5,
      total_pages: 3,
      has_next_page: true,
      has_prev_page: true,
    });
    expect(jsonCall.result).toHaveLength(2);
  });

  it("clamps page_size to MAX_PAGE_SIZE (100)", async () => {
    const { req, res, next } = createMockReqRes({ page_size: "9999" });
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(makeDbAgencies(3)),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.pagination.page_size).toBe(100);
  });

  it("clamps page to minimum of 1 for invalid page param", async () => {
    const { req, res, next } = createMockReqRes({ page: "-99" });
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(makeDbAgencies(2)),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.pagination.page).toBe(1);
  });

  it("returns empty result slice for page beyond total_pages", async () => {
    const { req, res, next } = createMockReqRes({
      page: "99",
      page_size: "10",
    });
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(makeDbAgencies(3)),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.result).toHaveLength(0);
    expect(jsonCall.pagination.has_next_page).toBe(false);
  });

  it("calls DB with correct table and fields", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = { getAllByTable: vi.fn().mockResolvedValueOnce([]) };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    expect(mockDb.getAllByTable).toHaveBeenCalledWith("agencies", [
      "cluster_id",
      "abbreviation",
      "year",
    ]);
  });

  it("returns 500 on DB error", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockRejectedValueOnce(new Error("DB failure")),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("does not cache result when DB throws", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockRejectedValueOnce(new Error("DB failure")),
    };

    await getUnitsFromRawAgencies(mockDb, cache)(req, res, next);

    expect(cache.has(CACHE_KEY)).toBe(false);
  });
});
