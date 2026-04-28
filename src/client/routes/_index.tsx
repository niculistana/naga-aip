import { HomePage } from "../pages/HomePage";

export default () => {
  return (
    <HomePage
      initialData={{ amounts: [], clusters: [], programs: [], agencies: [] }}
    />
  );
};
