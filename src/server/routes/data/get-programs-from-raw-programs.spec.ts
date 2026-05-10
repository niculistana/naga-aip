import { describe, it, beforeEach, vi, expect } from "vitest";
import { getProgramsFromRawPrograms } from "./get-programs-from-raw-programs.js";
import type { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";

const cache = new NodeCache();

const createMockReqRes = (query: Record<string, string> = {}) => {
  const req = {
    query,
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
};

const makeDbPrograms = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Program ${i + 1}`,
    implementation_start: "2020-01-01",
    implementation_end: "2099-12-31",
  }));

describe("getProgramsFromRawPrograms", () => {
  beforeEach(() => {
    cache.flushAll();
    vi.clearAllMocks();
  });

  it("returns 200 with default pagination when no query params provided", async () => {
    const { req, res, next } = createMockReqRes();
    const fakeDbResult = makeDbPrograms(3);
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);

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

  it("maps DB rows to Program shape with implementation_status", async () => {
    const { req, res, next } = createMockReqRes();
    const fakeDbResult = [
      {
        id: 42,
        name: "Test Program",
        implementation_start: "2020-01-01",
        implementation_end: "2099-12-31",
      },
    ];
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.result[0]).toMatchObject({
      program_id: "42",
      name: "Test Program",
      implementation_status: expect.stringMatching(/ACTIVE|PENDING|COMPLETE/),
    });
  });

  it("returns cached result and skips DB call on second request", async () => {
    const { req, res, next } = createMockReqRes();
    const fakeDbResult = makeDbPrograms(2);
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    // First call — populates cache
    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);
    expect(mockDb.getAllByTable).toHaveBeenCalledTimes(1);

    // Second call — should use cache
    const { req: req2, res: res2, next: next2 } = createMockReqRes();
    await getProgramsFromRawPrograms(mockDb, cache)(req2, res2, next2);
    expect(mockDb.getAllByTable).toHaveBeenCalledTimes(1); // still 1
    expect(res2.status).toHaveBeenCalledWith(200);
  });

  it("respects page and page_size query params", async () => {
    const { req, res, next } = createMockReqRes({ page: "2", page_size: "2" });
    const fakeDbResult = makeDbPrograms(5);
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);

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
    const fakeDbResult = makeDbPrograms(5);
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.pagination.page_size).toBe(100);
  });

  it("clamps page to minimum of 1 for invalid page param", async () => {
    const { req, res, next } = createMockReqRes({ page: "-5" });
    const fakeDbResult = makeDbPrograms(2);
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.pagination.page).toBe(1);
  });

  it("returns empty result slice for page beyond total_pages", async () => {
    const { req, res, next } = createMockReqRes({ page: "99", page_size: "10" });
    const fakeDbResult = makeDbPrograms(3);
    const mockDb: any = {
      getAllByTable: vi.fn().mockResolvedValueOnce(fakeDbResult),
    };

    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.result).toHaveLength(0);
    expect(jsonCall.pagination.has_next_page).toBe(false);
  });

  it("returns 500 on DB error", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockRejectedValueOnce(new Error("DB failure")),
    };

    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("does not cache result when DB throws", async () => {
    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn().mockRejectedValueOnce(new Error("DB failure")),
    };

    await getProgramsFromRawPrograms(mockDb, cache)(req, res, next);

    const cacheKey = `all-programs-id, name, implementation_start, implementation_end`;
    expect(cache.has(cacheKey)).toBe(false);
  });
});