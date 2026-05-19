import type { RawAgency, RawProgram, RawAmount } from "../types/index.js";
import { rawClusterToSectorFactory } from "./raw/raw-cluster-to-sector.factory.js";

export const buildSectorListFromClusterIds = async (
  clusterName: string,
  clusterIds: number[],
  agencies: RawAgency[],
  programs: RawProgram[],
  amounts: RawAmount[],
) => {
  const sectors = [];

  for (const clusterId of clusterIds) {
    const clusterAgencies: RawAgency[] = agencies.filter(
      (agency) => agency.cluster_id === clusterId,
    );
    const clusterAgenciesIds = clusterAgencies.map(({ id }) => id);
    const clusterPrograms: RawProgram[] = programs.filter((program) =>
      clusterAgenciesIds.includes(program.agency_id),
    );
    const clusterProgramsIds = clusterPrograms.map(({ id }) => id);
    const clusterAmounts: RawAmount[] = amounts.filter((amount) =>
      clusterProgramsIds.includes(amount.program_id),
    );

    const sector = await rawClusterToSectorFactory
      .params({
        id: clusterId,
        name: clusterName,
      })
      .transient({
        agencies: clusterAgencies,
        programs: clusterPrograms,
        amounts: clusterAmounts,
      })
      .build();

    sectors.push(sector);
  }

  return sectors;
};
