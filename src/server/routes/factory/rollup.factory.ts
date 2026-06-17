import { Factory } from "fishery";
import type { Rollup } from "../types/index.js";

type RollupParams = {
  ps: number;
  mooe: number;
  co: number;
  total: number;
  cc_adapt: number;
  cc_mitig: number;
  pap_count: number;
};

export const rollupFactory = Factory.define<Rollup, {}, Rollup, RollupParams>(
  ({ params }) => ({
    ps: params.ps,
    mooe: params.mooe,
    co: params.co,
    total: params.total,
    cc_adapt: params.cc_adapt,
    cc_mitig: params.cc_mitig,
    pap_count: params.pap_count,
  }),
);
