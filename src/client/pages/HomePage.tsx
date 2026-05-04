import { ClusterCard } from "@/components/ClusterCard";
import type { ClusterData } from "@/components/ClusterCard";

export function HomePage({
  initialData,
}: {
  initialData: {
    amounts: any[];
    clusters: any[];
    agencies: any[];
    programs: any[];
  };
}) {
  const agencies: any[] = initialData?.agencies || [];
  const programs: any[] = initialData?.programs || [];

  // Build agency_id → cluster_id lookup (all IDs are strings from the API)
  const agencyToCluster = new Map<string, string>(
    agencies.map((a: any) => [String(a.id), String(a.cluster_id)])
  );

  // Merge computed count into each cluster
  // TODO: replace filter with step 1 (cluster.program_ids) + step 2 (agency.program_id) once schema is confirmed
  const clusters: ClusterData[] = (initialData?.clusters || []).map((c: any) => ({
    ...c,
    program_count: programs.filter(
      (p: any) => agencyToCluster.get(String(p.agency_id)) === String(c.id)
    ).length,
  }));

  return (
    <div className="h-full w-full">
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Clusters</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((cluster: ClusterData) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      </section>
      {/* agencies, programs, amounts raw tables removed from home view — data still available via loader for future chart components */}
    </div>
  );
}
