import { Factory } from "fishery";
import type { PageData } from "../types/index.js";

export const pageDataFactory = Factory.define<PageData, {}, PageData, PageData>(
  ({ params }) => ({
    metadata: params.metadata,
    rollup: params.rollup,
    rollup_clean_excluding_outliers: params.rollup_clean_excluding_outliers,
    data_quality: params.data_quality,
    sectors: params.sectors,
  }),
);
