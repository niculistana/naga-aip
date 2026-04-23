import { HomePage } from "../pages/HomePage";
import { authClient } from "../lib/auth";
import { Navigate, useLoaderData } from "react-router";
import { getAll } from "../lib/db";

export async function loader({ request }: { request: Request }) {
  const agenciesPromise = await getAll("agencies");
  const amountsPromise = await getAll("amounts");
  const clustersPromise = await getAll("clusters");
  const programsPromise = await getAll("programs");

  const [agencies, amounts, clusters, programs] = await Promise.all([
    agenciesPromise,
    amountsPromise,
    clustersPromise,
    programsPromise,
  ]);

  return {
    agencies,
    amounts,
    clusters,
    programs,
  };
}

export default () => {
  const { data: session, isPending } = authClient.useSession();
  const initialData = useLoaderData();

  if (isPending) {
    return null;
  }

  if (!session) {
    return <Navigate to="/auth/signin" replace />;
  }
  return <HomePage initialData={initialData} />;
};
