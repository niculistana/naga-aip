import { Factory } from "fishery";
import type { Program, RawProgram, RawAmount, Item, Rollup } from "../../types/index.js";
import { rawAmountToItemFactory } from "./raw-amount-to-item.factory.js";
import {
  getImplementationStatus,
  ImplementationStatus,
} from "../../data/hardcode/programs.js";
import { toRollup } from "../../util/index.js";

type RawProgramToProgramTransientParams = {
  amounts: RawAmount[];
} & RawProgram;

type RawProgramToProgramParams = {
  name: string;
  program_id: number;
  items: Item[];
  implementation_status: ImplementationStatus;
  rollup: Rollup;
};

type FactoryProgram = Program | null;

export const rawProgramToProgramFactory = Factory.define<
  FactoryProgram,
  RawProgramToProgramTransientParams,
  Program,
  RawProgramToProgramParams
>(({ transientParams }) => {
  if (!transientParams.id || !transientParams.name) return null;

  const amounts = transientParams.amounts || [];

  let ps = 0.0;
  let mooe = 0.0;
  let co = 0.0;

  // NOTE: There are three categories per amounts
  for (const amount of amounts) {
    const category = amount.category;
    switch (category) {
      case "Personal Services (PS) (9)":
        ps = amount.amount;
        break;
      case "Capital Outlay (CO) (11)":
        co = amount.amount;
        break;
      case "Maintenance and Other Operating Expenses (MOOE) (10)":
        mooe = amount.amount;
        break;
      default:
        break;
    }
  }

  const rollup = toRollup(ps, mooe, co);

  // NOTE: There is only one item per program and it contains all allocations, personal services, maintenance, capital outlay, etc.
  return {
    name: transientParams.name,
    program_id: transientParams.id,
    items: [rawAmountToItemFactory.params({ ps, co, mooe }).build()],
    implementation_status: getImplementationStatus(
      transientParams.implementation_start,
      transientParams.implementation_end,
    ),
    rollup,
  };
});
