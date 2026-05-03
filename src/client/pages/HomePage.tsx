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
  // Build agency_id → cluster_id lookup (all IDs are strings from the API)
  const agencyToCluster = new Map<string, string>(
    (initialData?.agencies || []).map((a: any) => [String(a.id), String(a.cluster_id)])
  );

  // Count programs per cluster via the agency join
  const programCountByCluster = (initialData?.programs || []).reduce(
    (acc: Record<string, number>, program: any) => {
      const clusterId = agencyToCluster.get(String(program.agency_id));
      if (clusterId != null) {
        acc[clusterId] = (acc[clusterId] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Merge computed count into each cluster
  const clusters: ClusterData[] = (initialData?.clusters || []).map((c: any) => ({
    ...c,
    program_count: programCountByCluster[String(c.id)] ?? null,
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
