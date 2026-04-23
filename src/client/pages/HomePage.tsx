import { AnyList } from "../components/AnyList";
import { HeaderBodyFooterLayout } from "../components/HeaderBodyFooterLayout";
import { useState } from "react";
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
  const [amountsList, setAmountsList] = useState({
    list: initialData?.amounts || [],
    headers: ["amount", "category", "program_id", "created_at", "updated_at"],
    title: "Amounts",
  });
  const [clustersList, setClustersList] = useState({
    list: initialData?.clusters || [],
    headers: [
      "description",
      "name",
      "offices",
      "paps_count",
      "title",
      "subtitle",
      "theme",
      "total",
      "year",
      "created_at",
      "updated_at",
    ],
    title: "Clusters",
  });
  const [agenciesList, setAgenciesList] = useState({
    list: initialData?.agencies || [],
    headers: [
      "abbreviation",
      "cluster_id",
      "title",
      "description",
      "title",
      "year",
      "created_at",
      "updated_at",
    ],
    title: "Agencies",
  });
  const [programsList, setProgramsList] = useState({
    list: initialData?.programs || [],
    headers: [
      "agency_id",
      "aip_reference_code",
      "name",
      "description",
      "implementation_start",
      "implementation_end",
      "created_at",
      "updated_at",
    ],
    title: "Programs",
  });

  return (
    <div>
      <HeaderBodyFooterLayout>
        <div>
          <AnyList
            list={amountsList.list}
            headers={amountsList.headers}
            title={amountsList.title}
          />
        </div>
        <div>
          <AnyList
            list={clustersList.list}
            headers={clustersList.headers}
            title={clustersList.title}
          />
        </div>
        <div>
          <AnyList
            list={programsList.list}
            headers={programsList.headers}
            title={programsList.title}
          />
        </div>
        <div>
          <AnyList
            list={agenciesList.list}
            headers={agenciesList.headers}
            title={agenciesList.title}
          />
        </div>
      </HeaderBodyFooterLayout>
    </div>
  );
}
