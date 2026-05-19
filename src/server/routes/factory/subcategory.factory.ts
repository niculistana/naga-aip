import { Factory } from "fishery";
import type { Subcategory, Program, RawProgram, RawAmount } from "../types/index.js";
import { rawProgramToProgramFactory } from "./raw/raw-program-to-program.factory.js";
import { sumRollups } from "../util/index.js";

type SubcategoryTransientParams = {
  amounts: RawAmount[];
  programs: RawProgram[];
};

type SubcategoryParams = {};

export const subcategoryFactory = Factory.define<
  Subcategory,
  SubcategoryTransientParams,
  Subcategory,
  SubcategoryParams
>(({ transientParams }) => {
  const amounts: RawAmount[] = transientParams.amounts
    ? transientParams.amounts
    : [];
  const externalPrograms = transientParams.programs || [];

  const programs: Program[] = [];
  for (const externalProgram of externalPrograms) {
    const program = rawProgramToProgramFactory
      .transient({ ...externalProgram, amounts })
      .build();
    if (program) {
      programs.push(program);
    }
  }

  const programRollups = programs.map((program) => program.rollup);
  const subcategoryRollups = sumRollups(programRollups);

  // NOTE: Hard-coding Operations; but aip2026.json has "Operations", "General Administration Support", "Support to Operations", etc.
  return {
    name: "Operations",
    programs,
    rollup: subcategoryRollups,
  };
});
