export const getAll = (table: string, fields: string[]) =>
  fetch(`http://localhost:3000/api/data/all/${table}?fields=${fields}`).then(
    (data) => data.json(),
  );
