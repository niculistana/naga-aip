import { useState } from "react";
import { List } from "@bettergov/kapwa/list";
import type { ListSectionItem } from "@bettergov/kapwa/list";
import { Link } from "react-router";

interface Agency {
  id: string;
  abbreviation: string;
  cluster_id: string;
}

interface Program {
  id: string;
  name: string;
  agency_id: string;
}

interface ClusterDetailData {
  cluster: { id: string; name: string } | null;
  agencies: Agency[];
  programs: Program[];
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ClusterDetailPage({ data }: { data: ClusterDetailData }) {
  const { cluster, agencies, programs } = data;

  const [selectedAgencyIds, setSelectedAgencyIds] = useState<Set<string>>(
    new Set(),
  );

  function toggleAgency(agencyId: string) {
    setSelectedAgencyIds((prev) => {
      const next = new Set(prev);
      next.has(agencyId) ? next.delete(agencyId) : next.add(agencyId);
      return next;
    });
  }

  const agencyMap = new Map<string, string>(
    agencies.map((a) => [String(a.id), a.abbreviation]),
  );

  const filteredPrograms =
    selectedAgencyIds.size === 0
      ? programs
      : programs.filter((p) => selectedAgencyIds.has(String(p.agency_id)));

  const listItems: ListSectionItem[] = filteredPrograms.map((p) => ({
    id: Number(p.id),
    title: p.name,
    category: agencyMap.get(String(p.agency_id)) ?? "Unknown",
  }));

  if (!cluster) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Cluster not found.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {toTitleCase(cluster.name)}
        </h1>
        <Link to="/home" className="...">
          ← Back to Home
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          {programs.length} program{programs.length !== 1 ? "s" : ""} ·{" "}
          {agencies.length} agenc{agencies.length !== 1 ? "ies" : "y"}
        </p>
      </div>

      {/* Agency filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setSelectedAgencyIds(new Set())}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            selectedAgencyIds.size === 0
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
          }`}
        >
          All
        </button>
        {agencies.map((agency) => (
          <button
            key={agency.id}
            type="button"
            onClick={() => toggleAgency(String(agency.id))}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              selectedAgencyIds.has(String(agency.id))
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
            }`}
          >
            {agency.abbreviation}
          </button>
        ))}
      </div>

      {listItems.length === 0 ? (
        <p className="text-sm italic text-gray-400">
          No programs found for the selected filter.
        </p>
      ) : (
        <List
          title="Programs"
          headerTitle={toTitleCase(cluster.name)}
          headerSubtitle={`${filteredPrograms.length} of ${programs.length} programs`}
          listItems={listItems}
        />
      )}
    </div>
  );
}
