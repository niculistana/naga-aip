import { Factory } from "fishery";
import type {
  Unit,
  RawAgency,
  RawProgram,
  RawAmount,
} from "../../types/index.js";
import { subcategoryFactory } from "../subcategory.factory.js";
import { sumRollups } from "../../util/calc.js";

type AgencyToUnitTransientParams = {
  programs: RawProgram[];
  amounts: RawAmount[];
} & RawAgency;

type AgencyToUnitParams = {
  name: string;
};

export const rawAgencyToUnitFactory = Factory.define<
  Unit,
  AgencyToUnitTransientParams,
  Unit,
  AgencyToUnitParams
>(({ transientParams, params }) => {
  const programs = transientParams.programs || [];
  const amounts = transientParams.amounts;

  const subcategories = [
    subcategoryFactory.transient({ programs, amounts }).build(),
  ];

  const subcategoryRollups = subcategories.map(
    (subcategory) => subcategory.rollup,
  );
  const unitRollups = sumRollups(subcategoryRollups);

  return {
    name: params.name,
    rollup: unitRollups,
    subcategories,
  };
});
