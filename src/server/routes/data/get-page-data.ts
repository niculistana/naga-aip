import NodeCache from "node-cache";
import type { DBClient } from "../../db/db-client.js";
import type { Request, Response, NextFunction } from "express";
import { disclaimerMessage } from "../../util.js";
import type {
  RawAgency,
  RawAmount,
  RawCluster,
  RawProgram,
  Rollup,
} from "../types/index.js";
import { dataQualityFactory } from "../factory/data-quality.factory.js";
import { pageDataFactory } from "../factory/page-data.factory.js";
import { buildSectorListFromClusterIds } from "../factory/build-sector-list-from-cluster-ids.js";
import { metadataFactory } from "../factory/metadata.factory.js";
import { rollupFactory } from "../factory/rollup.factory.js";
import { EMPTY_ROLLUP } from "./hardcode/empty-rollup.js";
import { legacyAIPMetadata } from "./hardcode/aip-metadata.js";
import { sumRollups } from "../util/calc.js";

/*
 * Output shapes
 */
type Unit = {
  unit_id: string;
  abbreviation: string;
  year: string;
};

type Program = {
  program_id: number;
  program_name: string;
  implementation_status: string;
  units: Unit[];
};

type Sector = {
  id: number;
  name: string;
  year: number;
  programs: Program[];
};

const CACHE_KEY = "page-data";

export const getPageData =
  (db: DBClient, cache: NodeCache) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const message = disclaimerMessage;

    if (cache.has(CACHE_KEY)) {
      return res.status(200).json({
        result: cache.get(CACHE_KEY),
        message,
      });
    }

    try {
      const [agencies, programs, amounts] = (await Promise.all([
        db.getAllByTable("agencies", [
          "id",
          "abbreviation",
          "cluster_id",
          "year",
        ]),
        db.getAllByTable("programs", [
          "id",
          "name",
          "agency_id",
          "implementation_start",
          "implementation_end",
        ]),
        db.getAllByTable("amounts", ["id", "amount", "category", "program_id"]),
      ])) as [RawAgency[], RawProgram[], RawAmount[]];

      const metadata = metadataFactory.params(legacyAIPMetadata).build();
      const rollupCleanExcludingOutliers = rollupFactory
        .params(EMPTY_ROLLUP)
        .build();

      const dataQuality = dataQualityFactory
        .params({
          rows_total: 1216,
          rows_clean: 1194,
          missing_funding_source: 299,
          unit_check_outliers: 22,
          non_canonical_funding_source: 0,
        })
        .build();

      // NOTE: these sectors are provided by aip2026.json; ideally we pull directly from the clusters endpoint
      const economicSectorList = await buildSectorListFromClusterIds(
        "Economic",
        [5],
        agencies,
        programs,
        amounts,
      ); // economic

      const economicSectorRollups = economicSectorList.map(
        (sector) => sector.rollup,
      );

      const enviInfraHousingClusterList = await buildSectorListFromClusterIds(
        "Environment/Infrastructure/Housing",
        [7],
        agencies,
        programs,
        amounts,
      ); // envi_infra_urban_housing

      const enviInfraHousingRollups = enviInfraHousingClusterList.map(
        (sector) => sector.rollup,
      );

      const generalPublicServicesClusterList =
        await buildSectorListFromClusterIds(
          "General Public Services",
          [3, 6, 8],
          agencies,
          programs,
          amounts,
        ); // education, governance, healthy_naguenos

      const generalPublicServicesRollups = generalPublicServicesClusterList.map(
        (sector) => sector.rollup,
      );

      const socialSectorClusterIds = await buildSectorListFromClusterIds(
        "Social",
        [1, 2, 4],
        agencies,
        programs,
        amounts,
      ); // safe_secure_humane, social_protection_inclusion, culture_arts_heritage

      const socialRollups = generalPublicServicesClusterList.map(
        (sector) => sector.rollup,
      );

      const allSectors = [
        ...economicSectorList,
        ...enviInfraHousingClusterList,
        ...generalPublicServicesClusterList,
        ...socialSectorClusterIds,
      ];

      const allSectorRollups: Rollup[] = [
        ...economicSectorRollups,
        ...enviInfraHousingRollups,
        ...generalPublicServicesRollups,
        ...socialRollups,
      ];

      const pageDataRollup = sumRollups(allSectorRollups);

      const data = pageDataFactory
        .params({
          metadata,
          rollup: pageDataRollup,
          rollup_clean_excluding_outliers: rollupCleanExcludingOutliers,
          data_quality: dataQuality,
          sectors: allSectors,
        })
        .build();

      // Do we need a TTL?
      cache.set(CACHE_KEY, data);
      res.status(200).json({ result: data, message });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  };
