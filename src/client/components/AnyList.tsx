import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const AnyValue = ({ value }: { value: any }) => {
  return <span className="w-56 truncate">{value}</span>;
};

export const AnyListItem = ({ item }: { item: object }) => {
  const entries = Object.entries(item);
  return (
    <>
      {entries.map((entry) => {
        const [key, value] = entry;
        if (["implementation_start", "implementation_end"].includes(key)) {
          const formattedValue = dayjs.utc(value).format("DD/MM/YY");
          return <AnyValue value={formattedValue} />;
        }
        return <AnyValue value={value} />;
      })}
    </>
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
    <div className="mb-4">
      <h2 className="text-l font-bold">{title}</h2>
      <div
        className="grid grid-flow-col gap-x-2"
        style={{ gridTemplateColumns: `repeat(${colNum}, 256px)` }}
      >
        {headers.map((header) => {
          return (
            <span className="text-md font-semibold truncate">{header}</span>
          );
        })}
      </div>
      <div className="grid grid-flow-row gap-x-2">
        {list.length ? (
          list.map((item) => (
            <div
              className="grid grid-flow-col gap-x-2"
              style={{ gridTemplateColumns: `repeat(${colNum}, 256px)` }}
            >
              <AnyListItem item={item} />
            </div>
          ))
        ) : (
          <p>No {title}.</p>
        )}
      </div>
    </div>
  );
};
