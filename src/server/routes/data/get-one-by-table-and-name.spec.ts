import { describe, it, beforeEach, vi, expect } from "vitest";
import { getOneByTableAndName } from "./get-one-by-table-and-name.js";
import type { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";

const cache = new NodeCache();

// Helper to create mock req/res/next
const createMockReqRes = (
  fields = "name",
  table = "clusters",
  name = "Test Cluster",
) => {
  const req = {
    params: { table, name },
    query: { fields },
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
};

describe("getOneByTableAndName", () => {
  beforeEach(() => {
    cache.flushAll();
  });

  it("returns 400 for invalid table", async () => {
    const { req, res, next } = createMockReqRes("name", "invalid-table");
    const mockDb: any = { getOneByTableAndName: vi.fn() };
    await getOneByTableAndName(mockDb, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringMatching(/Invalid table/),
    });
  });

  it("returns 400 if fields param is missing", async () => {
    const { req, res, next } = createMockReqRes("");
    const mockDb: any = { getOneByTableAndName: vi.fn() };
    await getOneByTableAndName(mockDb, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringMatching(/Fields query params/),
    });
  });

  it("returns 400 if no allowed fields", async () => {
    const { req, res, next } = createMockReqRes("notallowed");
    const mockDb: any = { getOneByTableAndName: vi.fn() };
    await getOneByTableAndName(mockDb, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad request" });
  });

  it("returns cached result if present", async () => {
    const { req, res, next } = createMockReqRes();
    const cacheKey = `one-clusters-Test Cluster-name`;
    cache.set(cacheKey, [{ name: "Test Cluster" }]);
    const mockDb: any = { getOneByTableAndName: vi.fn() };
    await getOneByTableAndName(mockDb, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: [{ name: "Test Cluster" }],
      message: expect.any(String),
    });
  });

  it("queries DB and caches result if not cached", async () => {
    const { req, res, next } = createMockReqRes("name", "clusters", "Delta");
    const fakeResult = [{ name: "Delta" }];
    const mockDb: any = {
      getOneByTableAndName: vi.fn().mockResolvedValueOnce(fakeResult),
    };
    await getOneByTableAndName(mockDb, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: fakeResult,
      message: expect.any(String),
    });
    const cacheKey = `one-clusters-Delta-name`;
    expect(cache.get(cacheKey)).toEqual(fakeResult);
  });

  it("returns 500 on SQL error", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getOneByTableAndName: vi.fn().mockRejectedValueOnce(new Error("fail")),
    };
    await getOneByTableAndName(mockDb, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Internal server error" }),
    );
  });
});
