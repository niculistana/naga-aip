import path from "path";
export const allowedFields = [
  "id",
  "abbreviation",
  "name",
  "description",
  "theme",
  "title",
  "subtitle",
  "total",
  "offices",
  "paps_count",
  "year",
  "agency_id",
  "cluster_id",
  "amount",
  "category",
  "program_id",
  "aip_reference_code",
  "implementation_start",
  "implementation_end",
  "created_at",
  "updated_at",
];

export const SERVER_BASE_PATH_FROM_ROOT = "../../";
export const buildPath = path.join(
  import.meta.dirname,
  `${SERVER_BASE_PATH_FROM_ROOT}/build`,
);
export const ssrServerFile = "/ssr/server/index.js";
export const assetsFolder = "/ssr/client/assets";
export const assetsPath = path.join(buildPath, assetsFolder);
export const serverPath = path.join(buildPath, ssrServerFile);
