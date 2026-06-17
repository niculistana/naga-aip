import type { Rollup } from "../types/index.js";
import { EMPTY_ROLLUP } from "../data/hardcode/empty-rollup.js";

// TODO: Will migrate these methods in db
export const toRollup = (ps = 0, mooe = 0, co = 0, papCount = 0): Rollup => ({
  ps,
  mooe,
  co,
  total: ps + mooe + co,
  cc_adapt: 0,
  cc_mitig: 0,
  pap_count: papCount,
});

// TODO: Will migrate these methods in db
export const sumRollups = (rollups: Array<Rollup | undefined>): Rollup => {
  const totals: Rollup = {
    ...EMPTY_ROLLUP,
  };

  for (const rollup of rollups) {
    if (!rollup) continue;
    totals.ps += rollup.ps;
    totals.mooe += rollup.mooe;
    totals.co += rollup.co;
    totals.cc_adapt += rollup.cc_adapt;
    totals.cc_mitig += rollup.cc_mitig;
    totals.pap_count += rollup.pap_count;
  }

  return {
    ...totals,
    total: totals.ps + totals.mooe + totals.co, // NOTE: total here is just ps, mooe, co
  };
};
