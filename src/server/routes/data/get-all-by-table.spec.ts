import { describe, it, beforeEach, vi, expect } from "vitest";
import { getAllByTable } from "./get-all-by-table";
import type { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";

const cache = new NodeCache();

// Helper to create mock req/res/next
const createMockReqRes = (fields = "id", table = "users") => {
  const req = {
    params: { table },
    query: { fields },
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
};

describe("getAllByTable", () => {
  beforeEach(() => {
    cache.flushAll();
  });

  it("returns 400 if fields param is missing", async () => {
    const { req, res, next } = createMockReqRes("");
    await getAllByTable(vi.fn(), cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringMatching(/Fields query params/),
    });
  });

  it("returns 400 if no allowed fields", async () => {
    const { req, res, next } = createMockReqRes("notallowed");
    await getAllByTable(vi.fn(), cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad request" });
  });

  it("returns cached result if present", async () => {
    const { req, res, next } = createMockReqRes();
    const cacheKey = `all-users-id`;
    cache.set(cacheKey, [{ id: 1, name: "Test" }]);
    await getAllByTable(vi.fn(), cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: [{ id: 1, name: "Test" }],
    });
  });

  it("queries DB and caches result if not cached", async () => {
    const { req, res, next } = createMockReqRes();
    const fakeResult = [{ id: 2, name: "User2" }];
    const mockSql: any = vi.fn().mockResolvedValueOnce(fakeResult);
    mockSql.unsafe = vi.fn((str) => str);
    await getAllByTable(mockSql, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ result: fakeResult });
    const cacheKey = `all-users-id`;
    expect(cache.get(cacheKey)).toEqual(fakeResult);
  });

  it("returns 500 on SQL error", async () => {
    const { req, res, next } = createMockReqRes();
    const mockSql: any = vi.fn().mockRejectedValueOnce(new Error("fail"));
    mockSql.unsafe = vi.fn((str) => str);
    await getAllByTable(mockSql, cache)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Internal server error" }),
    );
  });
});
