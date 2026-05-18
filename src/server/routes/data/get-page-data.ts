import NodeCache from "node-cache";
import { DBClient } from "../../db/db-client.js";
import { NextFunction, RequestHandler, json } from "express";
import { disclaimerMessage } from "../../util.js";
import { getImplementationStatus } from "./hardcode/programs.js";
import { Response } from "express";

type ClusterRow = {
  id: number;
  name: string;
  year: number;
};

type AgencyRow = {
  id: number;
  abbreviation: string | null;
  cluster_id: number;
  year: number;
};

type ProgramRow = {
  id: number;
  name: string;
  agency_id: number;
  implementation_start: string | null;
  implementation_end: string | null;
};

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
  (db: DBClient, cache: NodeCache): RequestHandler =>
  async (_req, res, _next): Promise<void> => {
    const message = disclaimerMessage;

    if (cache.has(CACHE_KEY)) {
      res.status(200).json({
        result: cache.get(CACHE_KEY),
        message,
      });
      return;
    }

    try {
      const [clusters, agencies, programs] = (await Promise.all([
        db.getAllByTable("clusters", ["id", "name", "year"]),
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
      ])) as [ClusterRow[], AgencyRow[], ProgramRow[]];

      const agencyMap = new Map<number, AgencyRow>();
      for (const a of agencies) {
        agencyMap.set(a.id, a);
      }

      const clusterMap = new Map<number, Sector>();
      for (const c of clusters) {
        clusterMap.set(c.id, {
          id: c.id,
          name: c.name,
          year: c.year,
          programs: [],
        });
      }

      /*
       * Nest programs -> sectors, attach unit to each program
       */
      for (const p of programs) {
        const agency = agencyMap.get(p.agency_id);
        if (!agency) continue;

        const sector = clusterMap.get(agency.cluster_id);
        if (!sector) continue;

        const unit: Unit = {
          unit_id: String(agency.id),
          abbreviation: agency.abbreviation ?? "",
          year: String(agency.year),
        };

        sector.programs.push({
          program_id: p.id,
          program_name: p.name,
          implementation_status: getImplementationStatus(
            p.implementation_start ?? undefined,
            p.implementation_end ?? undefined,
          ),
          units: [unit],
        });
      }

      const result: Sector[] = Array.from(clusterMap.values()).sort(
        (a, b) => a.id - b.id,
      );
      for (const sector of result) {
        sector.programs.sort((a, b) => a.program_id - b.program_id);
        for (const program of sector.programs) {
          program.units.sort((a, b) => a.unit_id.localeCompare(b.unit_id));
        }
      }

      // Do we need a TTL?
      cache.set(CACHE_KEY, result);
      res.status(200).json({ result, message });
      return;
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  };
