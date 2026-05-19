import { Factory } from "fishery";
import type { Metadata } from "../types/index.js";

type MetadataParams = {
  title: string;
  version: string;
  source_workbook: string;
  currency_unit: string;
  fiscal_year: number;
  generated_by: string;
  schema_version: string;
  hierarchy: string[];
};

export const metadataFactory = Factory.define<
  Metadata,
  {},
  Metadata,
  MetadataParams
>(({ params }) => ({
  title: params.title,
  version: params.version,
  source_workbook: params.source_workbook,
  currency_unit: params.currency_unit,
  fiscal_year: params.fiscal_year,
  generated_by: params.generated_by,
  schema_version: params.schema_version,
  hierarchy: params.hierarchy,
}));
