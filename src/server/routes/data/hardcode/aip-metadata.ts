/** NOTE: this data will be added to the database
 *  for now hard-code these as part of the initial release
 *
 * Future endpoints:
 * - metadata: /api/data/metadata
 * - full + outliers rollup: /api/data/aggregate/full
 * - per sector rollup: /api/data/aggregate/sector/:sectorName
 * */
export const legacyAIPMetadata = {
  title: "Naga City \u2014 2026 Annual Investment Program",
  version: "1.0",
  source_workbook:
    "Copy of FINAL Updated Consolidated [AIP2026] NEW_TEMPLATE.xlsx",
  currency_unit: "PHP millions",
  fiscal_year: 2026,
  generated_by: "Cowork analysis",
  schema_version: "aip2026.v1",
  hierarchy: ["sector", "unit", "subcategory", "program", "item"],
};
