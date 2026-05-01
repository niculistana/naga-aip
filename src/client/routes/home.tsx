import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { HomePage } from "../pages/HomePage";

const getAll = ({ table, fields }: { table: string; fields: string[] }) => {
  const API_HOST = import.meta.env.VITE_API_HOST;

  const endpoint = `${API_HOST}/api/data/all/${table}?fields=${fields}`;

  return fetch(endpoint).then((data) => data.json());
};

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
  const clustersPromise = getAll({ table: "clusters", fields: clustersFields });
  const agenciesPromise = getAll({ table: "agencies", fields: agenciesFields });
  const programsPromise = getAll({ table: "programs", fields: programsFields });
  const amountsPromise = getAll({ table: "amounts", fields: amountsFields });

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
