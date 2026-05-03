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
  const clusters: ClusterData[] = initialData?.clusters || [];

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
