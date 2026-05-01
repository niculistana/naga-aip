export const getAllByTable = ({
  table,
  fields,
}: {
  table: string;
  fields: string[];
}) => {
  const API_HOST = import.meta.env.VITE_API_HOST;

  const endpoint = `${API_HOST}/api/data/all/${table}?fields=${fields}`;

  return fetch(endpoint).then((data) => data.json());
};
