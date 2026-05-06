import { describe, it, vi, expect, beforeEach } from "vitest";

vi.mock("./index.js", () => {
  const mockSql: any = vi.fn();
  mockSql.unsafe = vi.fn((str: string) => str);
  return { sql: mockSql };
});

import { sql } from "./index.js";
import { dbClient } from "./db-client.js";

const mockSql = sql as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("dbClient.getAllByTable", () => {
  it("calls sql with correct SELECT and returns coerced rows", async () => {
    const raw = [
      {
        name: "Cluster A",
        id: "1",
        paps_count: "5",
        total: "100",
        year: "2026",
      },
    ];
    mockSql.mockResolvedValueOnce(raw);

    const result = await dbClient.getAllByTable("clusters", [
      "name",
      "id",
      "paps_count",
      "total",
      "year",
    ]);

    expect(mockSql).toHaveBeenCalledOnce();
    expect(result).toEqual([
      { name: "Cluster A", id: 1, paps_count: 5, total: 100, year: 2026 },
    ]);
  });

  it("passes only the requested fields in the query", async () => {
    mockSql.mockResolvedValueOnce([{ name: "Cluster B" }]);

    await dbClient.getAllByTable("clusters", ["name"]);

    const [strings] = mockSql.mock.calls[0];
    expect(strings.join("")).toContain("SELECT");
    expect(strings.join("")).toContain("from");
  });

  it("does not coerce non-numeric string fields", async () => {
    mockSql.mockResolvedValueOnce([
      { category: "Personal Services", amount: "42.5", program_id: "3" },
    ]);

    const result = await dbClient.getAllByTable("amounts", [
      "category",
      "amount",
      "program_id",
    ]);

    expect(result).toEqual([
      { category: "Personal Services", amount: 42.5, program_id: 3 },
    ]);
  });
});

describe("dbClient.getOneByTableAndId", () => {
  it("calls sql with WHERE id clause and returns coerced rows", async () => {
    const raw = [{ id: "1", amount: "0.000", program_id: "1", category: "PS" }];
    mockSql.mockResolvedValueOnce(raw);

    const result = await dbClient.getOneByTableAndId(
      "amounts",
      ["id", "amount", "program_id", "category"],
      "1",
    );

    expect(mockSql).toHaveBeenCalledOnce();
    expect(result).toEqual([
      { id: 1, amount: 0, program_id: 1, category: "PS" },
    ]);
  });

  it("passes id as a parameterized value (not inlined in SQL strings)", async () => {
    mockSql.mockResolvedValueOnce([]);

    await dbClient.getOneByTableAndId("amounts", ["id"], "42");

    const [strings, ...params] = mockSql.mock.calls[0];
    expect(strings.join("")).not.toContain("42");
    expect(params).toContain("42");
  });
});

describe("dbClient.getOneByTableAndName", () => {
  it("calls sql with WHERE name clause and returns coerced rows", async () => {
    const raw = [{ id: "7", name: "Education", year: "2026" }];
    mockSql.mockResolvedValueOnce(raw);

    const result = await dbClient.getOneByTableAndName(
      "clusters",
      ["id", "name", "year"],
      "Education",
    );

    expect(mockSql).toHaveBeenCalledOnce();
    expect(result).toEqual([{ id: 7, name: "Education", year: 2026 }]);
  });

  it("passes name as a parameterized value (not inlined in SQL strings)", async () => {
    mockSql.mockResolvedValueOnce([]);

    await dbClient.getOneByTableAndName("clusters", ["name"], "Health");

    const [strings, ...params] = mockSql.mock.calls[0];
    expect(strings.join("")).not.toContain("Health");
    expect(params).toContain("Health");
  });
});
