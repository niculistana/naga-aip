// NOTE: These types are "internal" to this app

import type { ImplementationStatus } from "../data/hardcode/programs.js";
import type {
  Cluster as RawCluster,
  Program as RawProgram,
  Agency as RawAgency,
  Amount as RawAmount,
} from "./raw.js";

export type { RawCluster, RawProgram, RawAgency, RawAmount };

export type Item = {
  amount: {
    ps: number;
    mooe: number;
    co: number;
  };
};
export type Program = {
  name: string;
  program_id: number;
  items: Item[];
  rollup: Rollup;
  implementation_status: ImplementationStatus;
};

export type Subcategory = {
  name: string;
  programs: Program[];
  rollup: Rollup;
};

export type Unit = {
  name: string;
  subcategories: Subcategory[];
  rollup: Rollup;
};

export type Sector = {
  name?: string;
  units: Unit[];
  rollup: Rollup;
};

export type PageData = {
  metadata: Metadata;
  rollup: Rollup;
  rollup_clean_excluding_outliers: Rollup;
  data_quality: DataQuality;
  sectors: Sector[];
};

export type Rollup = {
  ps: number;
  mooe: number;
  co: number;
  total: number;
  cc_adapt: number;
  cc_mitig: number;
  pap_count: number;
};

export type DataQuality = {
  rows_total: number;
  rows_clean: number;
  unit_check_outliers: number;
  missing_funding_source: number;
  non_canonical_funding_source: number;
};

export type Metadata = {
  title: string;
  version: string;
  source_workbook: string;
  currency_unit: string;
  fiscal_year: number;
  generated_by: string;
  schema_version: string;
  hierarchy: string[];
};
