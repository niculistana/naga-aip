import { describe, it, beforeEach, vi, expect } from "vitest";
import { getSectorsFromClusters } from "./get-sectors-from-raw-clusters.js";
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

const CACHE_KEY = "all-clusters-id, name, year";

describe("getSectorsFromClusters", () => {
  beforeEach(() => {
    cache.flushAll();
    vi.clearAllMocks();
  });

  it("returns 200 with DB result and message", async () => {
    const { req, res, next } = createMockReqRes();
    const fakeResult = [
      { id: 1, name: "Sector A", year: 2021 },
      { id: 2, name: "Sector B", year: 2022 },
    ];
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeResult),
    };

    await getSectorsFromClusters(mockDb, cache)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: fakeResult,
      message: expect.any(String),
    });
  });

  it("caches the DB result after the first call", async () => {
    const { req, res, next } = createMockReqRes();
    const fakeResult = [{ id: 1, name: "Sector A", year: 2021 }];
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeResult),
    };

    await getSectorsFromClusters(mockDb, cache)(req, res, next);

    expect(cache.get(CACHE_KEY)).toEqual(fakeResult);
  });

  it("returns cached result and skips DB call on second request", async () => {
    cache.set(CACHE_KEY, [{ id: 99, name: "Cached Sector", year: 2020 }]);
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn(),
    };

    await getSectorsFromClusters(mockDb, cache)(req, res, next);

    expect(mockDb.getAllByTable).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: [{ id: 99, name: "Cached Sector", year: 2020 }],
      message: expect.any(String),
    });
  });

  it("returns 500 on DB error", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockRejectedValueOnce(new Error("DB failure")),
    };

    await getSectorsFromClusters(mockDb, cache)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("does not cache result when DB throws", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockRejectedValueOnce(new Error("DB failure")),
    };

    await getSectorsFromClusters(mockDb, cache)(req, res, next);

    expect(cache.has(CACHE_KEY)).toBe(false);
  });

  it("calls DB with correct table and fields", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce([]),
    };

    await getSectorsFromClusters(mockDb, cache)(req, res, next);

    expect(mockDb.getAllByTable).toHaveBeenCalledWith("clusters", [
      "id",
      "name",
      "year",
    ]);
  });
});