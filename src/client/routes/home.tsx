import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { HomePage } from "@/pages/HomePage";
import { getAllByTable } from "@/api/getAllByTable";

export const clustersFields = [
  "description",
  "name",
  "offices",
  "paps_count",
  "title",
  "subtitle",
  "theme",
  "total",
];
export const agenciesFields = [
  "id",
  "abbreviation",
  "cluster_id",
  "title",
  "description",
];

export const programsFields = [
  "agency_id",
  "aip_reference_code",
  "name",
  "description",
  "implementation_start",
  "implementation_end",
];

export const amountsFields = ["amount", "program_id", "category"];

export async function loader({ params }: LoaderFunctionArgs) {
  const clustersPromise = getAllByTable({
    table: "clusters",
    fields: clustersFields,
  });
  const agenciesPromise = getAllByTable({
    table: "agencies",
    fields: agenciesFields,
  });
  const programsPromise = getAllByTable({
    table: "programs",
    fields: programsFields,
  });
  const amountsPromise = getAllByTable({
    table: "amounts",
    fields: amountsFields,
  });

  const allPromises = [
    clustersPromise,
    agenciesPromise,
    programsPromise,
    amountsPromise,
  ];

  const [clusters, agencies, programs, amounts] = await Promise.all(
    allPromises,
  ).then(([_clusters, _agencies, _programs, _amounts]) => {
    return [
      _clusters.result,
      _agencies.result,
      _programs.result,
      _amounts.result,
    ];
  });

  return {
    amounts,
    clusters,
    agencies,
    programs,
  };
}

export default () => {
  const initialData = useLoaderData();
  return <HomePage initialData={initialData} />;
};
