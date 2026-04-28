import { describe, it, beforeEach, vi, expect } from "vitest";
import { getOneByTableAndId } from "./get-one-by-table-and-id";
import type { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
// import { getAllByTable } from "./get-all-by-table";

const cache = new NodeCache();

// Helper to create mock req/res/next
const createMockReqRes = (fields = "id", table = "users", id = "123") => {
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
    const { req, res, next } = createMockReqRes("", "users", "123");
    await getOneByTableAndId(vi.fn(), cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringMatching(/Fields query params/),
    });
  });

  it("returns 400 if no allowed fields", async () => {
    const { req, res, next } = createMockReqRes("notallowed", "users", "123");
    await getOneByTableAndId(vi.fn(), cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad request" });
  });

  it("returns cached result if present", async () => {
    const { req, res, next } = createMockReqRes();
    const cacheKey = `one-users-123-id`;
    cache.set(cacheKey, [{ id: 123, name: "Test" }]);
    const mockSql: any = vi.fn();
    mockSql.unsafe = vi.fn((str) => str);
    await getOneByTableAndId(mockSql, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: [{ id: 123, name: "Test" }],
    });
  });

  it("queries DB and caches result if not cached", async () => {
    const { req, res, next } = createMockReqRes("id", "users", "124");
    console.log(req.params, req.query);
    const fakeResult = [{ id: 124, name: "User123" }];
    const mockSql: any = vi.fn().mockResolvedValueOnce(fakeResult);
    mockSql.unsafe = vi.fn((str) => str);
    await getOneByTableAndId(mockSql, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ result: fakeResult });
    const cacheKey = `one-users-124-id`;
    expect(cache.get(cacheKey)).toEqual(fakeResult);
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
