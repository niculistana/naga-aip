export const getAll = (table: string) =>
  fetch(`http://localhost:3000/api/data/all/${table}`).then((data) =>
    data.json(),
  );
