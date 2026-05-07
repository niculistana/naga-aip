import { useState, useRef } from "react";
import { List } from "@bettergov/kapwa/list";
import type { ListSectionItem } from "@bettergov/kapwa/list";
import { Link } from "react-router";

const PAGE_SIZE = 10;

interface Agency {
  id: string;
  abbreviation: string;
  cluster_id: string;
}

interface Program {
  id: string;
  name: string;
  agency_id: string;
  implementation_start: string | null;
  implementation_end: string | null;
}

function getStatus(
  start: string | null,
  end: string | null,
): "Active" | "Inactive" {
  if (!start || !end) return "Inactive";
  const today = new Date();
  return today >= new Date(start) && today <= new Date(end)
    ? "Active"
    : "Inactive";
}

interface ClusterDetailData {
  cluster: { id: string; name: string } | null;
  agencies: Agency[];
  programs: Program[];
}

export function ClusterDetailPage({ data }: { data: ClusterDetailData }) {
  const { cluster, agencies, programs } = data;
  const topRef = useRef<HTMLDivElement>(null);

  const [selectedAgencyIds, setSelectedAgencyIds] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);

  function toggleAgency(agencyId: string) {
    setSelectedAgencyIds((prev) => {
      const next = new Set(prev);
      next.has(agencyId) ? next.delete(agencyId) : next.add(agencyId);
      setCurrentPage(1);
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPrograms.length / PAGE_SIZE),
  );
  const currentPageClamped = Math.min(currentPage, totalPages);
  const startIndex = (currentPageClamped - 1) * PAGE_SIZE;
  const visibleStart = filteredPrograms.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(startIndex + PAGE_SIZE, filteredPrograms.length);
  const paginatedPrograms = filteredPrograms.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const listItems: ListSectionItem[] = paginatedPrograms.map((p) => ({
    id: Number(p.id),
    title: p.name,
    category: `${agencyMap.get(String(p.agency_id)) ?? "Unknown"} · ${getStatus(p.implementation_start, p.implementation_end)}`,
  }));

  if (!cluster) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Cluster not found.
      </div>
    );
  }

  return (
    <div ref={topRef} className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{cluster.name}</h1>
        <Link
          to="/home"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-2"
        >
          ← Back to Clusters
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
          onClick={() => {
            setSelectedAgencyIds(new Set());
            setCurrentPage(1);
          }}
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
        <>
          <List
            title="Programs"
            headerTitle="Program List"
            headerSubtitle={`Showing ${visibleStart}-${visibleEnd} of ${filteredPrograms.length} programs · Page ${currentPageClamped} of ${totalPages}`}
            listItems={listItems}
          />

          {filteredPrograms.length > PAGE_SIZE ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((page) => Math.max(1, page - 1));
                  topRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPageClamped === 1}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:border disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>

              <p className="text-sm text-gray-500">
                Showing {visibleStart}-{visibleEnd} of {filteredPrograms.length}{" "}
                · Page {currentPageClamped} of {totalPages}
              </p>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage((page) => Math.min(totalPages, page + 1));
                  topRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPageClamped === totalPages}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:border disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
