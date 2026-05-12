import path from "path";
const DEFAULT_ALLOWED_FIELDS = ["id", "created_at", "updated_at"];

export const disclaimerMessage = 'This API may be missing data which we are actively looking to add to, please file a request on Github to prioritize it.'

export const getAllowedFieldsForTable = (table: string) => {
  switch (table) {
    case "clusters":
      return [
        ...DEFAULT_ALLOWED_FIELDS,
        "description",
        "name",
        "offices",
        "paps_count",
        "subtitle",
        "theme",
        "title",
        "total",
        "year",
      ];
    case "agencies":
      return [
        ...DEFAULT_ALLOWED_FIELDS,
        "abbreviation",
        "cluster_id",
        "description",
        "title",
        "year",
      ];
    case "programs":
      return [
        ...DEFAULT_ALLOWED_FIELDS,
        "agency_id",
        "aip_reference_code",
        "description",
        "implementation_start",
        "implementation_end",
        "name",
      ];
    case "amounts":
      return [...DEFAULT_ALLOWED_FIELDS, "amount", "category", "program_id"];
    default:
      return [];
  }
};

const numericFieldsByTable: Record<string, Set<string>> = {
  clusters: new Set(["id", "paps_count", "total", "year"]),
  agencies: new Set(["id", "cluster_id", "year"]),
  programs: new Set(["id", "agency_id"]),
  amounts: new Set(["id", "amount", "program_id"]),
};

const coerceStringToNumber = (value: string): string | number => {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return value;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : value;
};

export const coerceNumericFields = <T>(table: string, rows: T): T => {
  if (!Array.isArray(rows)) {
    return rows;
  }

  const numericFields = numericFieldsByTable[table];
  if (!numericFields) {
    return rows;
  }

  return rows.map((row) => {
    if (!row || typeof row !== "object") {
      return row;
    }

    const nextRow: Record<string, unknown> = {
      ...(row as Record<string, unknown>),
    };

    for (const field of numericFields) {
      const value = nextRow[field];
      if (typeof value === "string") {
        nextRow[field] = coerceStringToNumber(value);
      }
    }

    return nextRow;
  }) as T;
};

export const allowedFields = [
  ...new Set([
    ...DEFAULT_ALLOWED_FIELDS,
    ...getAllowedFieldsForTable("clusters"),
    ...getAllowedFieldsForTable("agencies"),
    ...getAllowedFieldsForTable("programs"),
    ...getAllowedFieldsForTable("amounts"),
  ]),
];

export const allowedTables = ["clusters", "agencies", "programs", "amounts"];

export const SERVER_BASE_PATH_FROM_ROOT = "../../";
export const buildPath = path.join(
  import.meta.dirname,
  `${SERVER_BASE_PATH_FROM_ROOT}/build`,
);
export const ssrServerFile = "/ssr/server/index.js";
export const clientFolder = "/ssr/client";
export const clientPath = path.join(buildPath, clientFolder);
export const serverPath = path.join(buildPath, ssrServerFile);
