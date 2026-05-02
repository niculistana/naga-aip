import path from "path";

export const getAllowedFieldsForTable = (table: string) => {
  switch (table) {
    case "clusters":
      return [
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
      return ["abbreviation", "cluster_id", "description", "title", "year"];
    case "programs":
      return [
        "agency_id",
        "aip_reference_code",
        "description",
        "implementation_start",
        "implementation_end",
        "name",
      ];
    case "amounts":
      return ["amount", "category", "program_id"];
    default:
      return [];
  }
};

export const allowedFields = [
  ...getAllowedFieldsForTable("clusters"),
  ...getAllowedFieldsForTable("agencies"),
  ...getAllowedFieldsForTable("programs"),
  ...getAllowedFieldsForTable("amounts"),
  "created_at",
  "updated_at",
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
