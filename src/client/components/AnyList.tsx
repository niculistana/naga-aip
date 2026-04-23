export const AnyValue = ({ value }: { value: any }) => {
  return <span className="truncate">{value}</span>;
};

export const AnyListItem = ({ item }: { item: object }) => {
  const entries = Object.entries(item);
  return (
    <div>
      {entries.map((entry) => {
        const [_, value] = entry;
        return <AnyValue value={value} />;
      })}
    </div>
  );
};

export const AnyList = ({
  list,
  headers,
  title,
}: {
  list: any[];
  headers: string[];
  title: string;
}) => {
  const colNum = headers.length;
  return (
    <>
      <p>{title}</p>
      <div
        className="grid grid-flow-col gap-x-2"
        style={{ gridTemplateColumns: `repeat(${colNum}, 120px)` }}
      >
        {headers.map((header) => {
          return <span className="truncate">{header}</span>;
        })}
      </div>
      <div
        className="grid grid-flow-col gap-x-2"
        style={{ gridTemplateColumns: `repeat(${colNum}, 120px)` }}
      >
        <>
          {list.length ? (
            list.map((item) => <AnyListItem item={item} />)
          ) : (
            <p>No {title}.</p>
          )}
        </>
      </div>
    </>
  );
};
