import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { ClusterDetailPage } from "@/pages/ClusterDetailPage";
import { getAllByTable } from "@/api/getAllByTable";

export async function loader({ params }: LoaderFunctionArgs) {
  const clusterId = Number(params.id);

  const [agenciesRes, programsRes, clustersRes] = await Promise.all([
    getAllByTable({ table: "agencies", fields: ["id", "abbreviation", "cluster_id"] }),
    getAllByTable({ table: "programs", fields: ["id", "name", "agency_id", "implementation_start", "implementation_end"] }),
    getAllByTable({ table: "clusters", fields: ["id", "name"] }),
  ]);

  const allAgencies = agenciesRes.result || [];
  const allPrograms = programsRes.result || [];
  const allClusters = clustersRes.result || [];

  const cluster = allClusters.find((c: any) => c.id === clusterId) ?? null;
  const agencies = allAgencies.filter((a: any) => a.cluster_id === clusterId);
  const agencyIds = new Set(agencies.map((a: any) => a.id));
  const programs = allPrograms.filter((p: any) => agencyIds.has(p.agency_id));

  return { cluster, agencies, programs };
}

export default function ClusterAllocationRoute() {
  const data = useLoaderData();
  return <ClusterDetailPage data={data as any} />;
}
