import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
import { getPageData } from "./get-page-data.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const cache = new NodeCache();
const CACHE_KEY = "page-data";

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

  it("returns 200 with nested sectors, programs, and units", async () => {
    const { req, res, next } = createMockReqRes();

    const mockDb: any = {
      getAllByTable: vi
        .fn()
        .mockResolvedValueOnce([
          // Clusters
          { id: 1, name: "Economic", year: 2026 },
          { id: 2, name: "Social", year: 2026 },
        ])
        .mockResolvedValueOnce([
          // Sectors
          { id: 10, abbreviation: "ABE", cluster_id: 1, year: 2026 },
          { id: 20, abbreviation: "DSWD", cluster_id: 2, year: 2026 },
        ])
        // Programs
        .mockResolvedValueOnce([
          {
            id: 101,
            name: "Farmers Program",
            agency_id: 10,
            implementation_start: "2026-01-01",
            implementation_end: "2026-12-31",
          },
          {
            id: 102,
            name: "Welfare Program",
            agency_id: 20,
            implementation_start: "2026-06-01",
            implementation_end: "2026-12-31",
          },
        ]),
    };
    await getPageData(mockDb, cache)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];

    expect(jsonCall.result).toEqual([
      {
        id: 1,
        name: "Economic",
        year: 2026,
        programs: [
          {
            program_id: 101,
            program_name: "Farmers Program",
            implementation_status: expect.any(String),
            units: [
              {
                unit_id: "10",
                abbreviation: "ABE",
                year: "2026",
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: "Social",
        year: 2026,
        programs: [
          {
            program_id: 102,
            program_name: "Welfare Program",
            implementation_status: expect.any(String),
            units: [
              {
                unit_id: "20",
                abbreviation: "DSWD",
                year: "2026",
              },
            ],
          },
        ],
      },
    ]);

    expect(jsonCall.message).toEqual(expect.any(String));
  });
  // ---------------------------------------------------------------------------
  it("skips programs whose agency_id does not exist", async () => {
    const { req, res, next } = createMockReqRes();

    const mockDb: any = {
      getAllByTable: vi
        .fn()
        .mockResolvedValueOnce([{ id: 1, name: "Econ", year: 2026 }])
        .mockResolvedValueOnce([]) // no agencies
        .mockResolvedValueOnce([
          {
            id: 999,
            name: "Orphan Program",
            agency_id: 404,
            implementation_start: null,
            implementation_end: null,
          },
        ]),
    };

    await getPageData(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.result[0].programs).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  it("skips programs whose agency cluster_id points to missing sector", async () => {
    const { req, res, next } = createMockReqRes();

    const mockDb: any = {
      getAllByTable: vi
        .fn()
        .mockResolvedValueOnce([{ id: 1, name: "Econ", year: 2026 }])
        .mockResolvedValueOnce([
          { id: 10, abbreviation: "X", cluster_id: 999, year: 2026 },
        ])
        .mockResolvedValueOnce([
          {
            id: 1,
            name: "P",
            agency_id: 10,
            implementation_start: null,
            implementation_end: null,
          },
        ]),
    };

    await getPageData(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.result[0].programs).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  it("returns sectors with empty programs when no programs exist", async () => {
    const { req, res, next } = createMockReqRes();

    const mockDb: any = {
      getAllByTable: vi
        .fn()
        .mockResolvedValueOnce([{ id: 1, name: "Econ", year: 2026 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
    };

    await getPageData(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.result).toEqual([
      { id: 1, name: "Econ", year: 2026, programs: [] },
    ]);
  });

  // ---------------------------------------------------------------------------
  it("caches the result after first call", async () => {
    const { req, res, next } = createMockReqRes();

    const mockDb: any = {
      getAllByTable: vi
        .fn()
        .mockResolvedValueOnce([{ id: 1, name: "X", year: 2026 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
    };

    await getPageData(mockDb, cache)(req, res, next);
    expect(cache.has(CACHE_KEY)).toBe(true);
  });

  // ---------------------------------------------------------------------------
  it("returns cached result on second request without hitting DB", async () => {
    cache.set(CACHE_KEY, [
      { id: 99, name: "Cached", year: 2020, programs: [] },
    ]);

    const { req, res, next } = createMockReqRes();
    const mockDb: any = {
      getAllByTable: vi.fn(),
    };

    await getPageData(mockDb, cache)(req, res, next);

    expect(mockDb.getAllByTable).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.result).toEqual([
      { id: 99, name: "Cached", year: 2020, programs: [] },
    ]);
  });

  // ---------------------------------------------------------------------------
  it("returns 500 on DB error", async () => {
    const { req, res, next } = createMockReqRes();

    const mockDb: any = {
      getAllByTable: vi.fn().mockRejectedValueOnce(new Error("boom")),
    };

    await getPageData(mockDb, cache)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    expect(cache.has(CACHE_KEY)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  it("produces deterministic output (sorted by id)", async () => {
    const { req, res, next } = createMockReqRes();

    const mockDb: any = {
      getAllByTable: vi
        .fn()
        // clusters out of order
        .mockResolvedValueOnce([
          { id: 3, name: "C", year: 2026 },
          { id: 1, name: "A", year: 2026 },
        ])
        .mockResolvedValueOnce([
          { id: 10, abbreviation: "X", cluster_id: 1, year: 2026 },
          { id: 20, abbreviation: "Y", cluster_id: 1, year: 2026 },
        ])
        // programs out of order
        .mockResolvedValueOnce([
          {
            id: 200,
            name: "Z",
            agency_id: 10,
            implementation_start: null,
            implementation_end: null,
          },
          {
            id: 100,
            name: "A",
            agency_id: 10,
            implementation_start: null,
            implementation_end: null,
          },
        ]),
    };

    await getPageData(mockDb, cache)(req, res, next);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const result = jsonCall.result as any[];

    // sectors ordered by id
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
    // programs ordered by program_id
    expect(result[0].programs[0].program_id).toBe(100);
    expect(result[0].programs[1].program_id).toBe(200);
  });
});
