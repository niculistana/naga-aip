import { describe, it, beforeEach, vi, expect } from "vitest";
import { getOneByTableAndId } from "./get-one-by-table-and-id.js";
import type { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
// import { getAllByTable } from "./get-all-by-table";

const cache = new NodeCache();

// Helper to create mock req/res/next
const createMockReqRes = (fields = "name", table = "clusters", id = "123") => {
  const req = {
    params: { table, id },
    query: { fields },
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
};

describe("getOneByTableAndId", () => {
  beforeEach(() => {
    cache.flushAll();
  });

  it("returns 400 if fields param is missing", async () => {
    const { req, res, next } = createMockReqRes("", "clusters", "123");
    await getOneByTableAndId(vi.fn(), cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringMatching(/Fields query params/),
    });
  });

  it("returns 400 if no allowed fields", async () => {
    const { req, res, next } = createMockReqRes(
      "notallowed",
      "clusters",
      "123",
    );
    await getOneByTableAndId(vi.fn(), cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad request" });
  });

  it("returns cached result if present", async () => {
    const { req, res, next } = createMockReqRes();
    const cacheKey = `one-clusters-123-name`;
    cache.set(cacheKey, [{ name: "Test" }]);
    const mockSql: any = vi.fn();
    mockSql.unsafe = vi.fn((str) => str);
    await getOneByTableAndId(mockSql, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: [{ name: "Test" }],
      message: expect.any(String),
    });
  });

  it("queries DB and caches result if not cached", async () => {
    const { req, res, next } = createMockReqRes("name", "clusters", "124");
    const fakeResult = [{ name: "Cluster123" }];
    const mockSql: any = vi.fn().mockResolvedValueOnce(fakeResult);
    mockSql.unsafe = vi.fn((str) => str);
    await getOneByTableAndId(mockSql, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: fakeResult,
      message: expect.any(String),
    });
    const cacheKey = `one-clusters-124-name`;
    expect(cache.get(cacheKey)).toMatchObject(fakeResult);
  });

  it("returns 500 on SQL error", async () => {
    const { req, res, next } = createMockReqRes();
    const mockSql: any = vi.fn().mockRejectedValueOnce(new Error("fail"));
    mockSql.unsafe = vi.fn((str) => str);
    await getOneByTableAndId(mockSql, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Internal server error" }),
    );
  });
});
