import { Factory } from "fishery";
import type { DataQuality } from "../types/index.js";
type DataQualityParams = {
  rows_total: number;
  rows_clean: number;
  unit_check_outliers: number;
  missing_funding_source: number;
  non_canonical_funding_source: number;
};

export const dataQualityFactory = Factory.define<
  DataQuality,
  {},
  DataQuality,
  DataQualityParams
>(({ params }) => ({
  rows_total: params.rows_total,
  rows_clean: params.rows_clean,
  unit_check_outliers: params.unit_check_outliers,
  missing_funding_source: params.missing_funding_source,
  non_canonical_funding_source: params.non_canonical_funding_source,
}));
