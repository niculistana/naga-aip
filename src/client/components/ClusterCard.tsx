import { Link } from "react-router";
import { Card, CardHeader, CardContent } from "@bettergov/kapwa/card";

export interface ClusterData {
  id: string | number;
  name: string;
  description?: string | null;
  paps_count?: number | null;     // pre-aggregated from DB (currently null)
  program_count?: number | null;  // derived client-side via agency join — preferred over paps_count
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ClusterCard({ cluster }: { cluster: ClusterData }) {
  const displayCount = cluster.program_count ?? cluster.paps_count;

  return (
    <Link to={`/cluster/${cluster.id}/allocation`} className="block">
      <Card hoverable>
        <CardHeader>
          <h2 className="text-lg font-semibold">{toTitleCase(cluster.name)}</h2>
        </CardHeader>
        <CardContent>
          {cluster.description ? (
            <p className="text-sm text-gray-600 mb-3">{cluster.description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic mb-3">
              No description available
            </p>
          )}
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {displayCount != null ? `${displayCount} Programs` : "Programs: —"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
