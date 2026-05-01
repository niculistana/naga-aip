import { AnyList } from "@/components/AnyList";
import { useState } from "react";
import {
  amountsFields,
  clustersFields,
  agenciesFields,
  programsFields,
} from "@/routes/home";

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
    headers: amountsFields,
    title: "Amounts",
  });
  const [clustersList, setClustersList] = useState({
    list: initialData?.clusters || [],
    headers: clustersFields,
    title: "Clusters",
  });
  const [agenciesList, setAgenciesList] = useState({
    list: initialData?.agencies || [],
    headers: agenciesFields,
    title: "Agencies",
  });
  const [programsList, setProgramsList] = useState({
    list: initialData?.programs || [],
    headers: programsFields,
    title: "Programs",
  });

  return (
    <div className="h-full">
      <div>
        <AnyList
          list={clustersList.list}
          headers={clustersList.headers}
          title={clustersList.title}
        />
      </div>
      <div>
        <AnyList
          list={agenciesList.list}
          headers={agenciesList.headers}
          title={agenciesList.title}
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
          list={amountsList.list}
          headers={amountsList.headers}
          title={amountsList.title}
        />
      </div>
    </div>
  );
}
