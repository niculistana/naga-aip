import { Factory } from "fishery";
import type {
  Unit,
  Sector,
  RawCluster,
  RawAgency,
  RawProgram,
  RawAmount,
} from "../../types/index.js";
import { rawAgencyToUnitFactory } from "./raw-agency-to-unit.factory.js";
import { sumRollups } from "../../util/index.js";

type ClusterToSectorTransientParams = {
  agencies: RawAgency[];
  programs: RawProgram[];
  amounts: RawAmount[];
} & RawCluster;

type ClusterToSectorParams = {
  id: number;
  name: string;
};

export const rawClusterToSectorFactory = Factory.define<
  Sector,
  ClusterToSectorTransientParams,
  Sector,
  ClusterToSectorParams
>(({ params, transientParams }) => {
  const agencies = transientParams.agencies ?? [];
  const programs = transientParams.programs;
  const amounts = transientParams.amounts;

  const units: Unit[] = [];
  for (const agency of agencies) {
    const unit = rawAgencyToUnitFactory
      .params({ name: agency.name })
      .transient({ ...agency, programs, amounts })
      .build();
    units.push(unit);
  }

  const unitRollups = units.map((unit) => unit.rollup);
  const sectorRollups = sumRollups(unitRollups);

  return {
    id: params.id,
    name: params.name,
    units,
    rollup: sectorRollups,
  };
});
