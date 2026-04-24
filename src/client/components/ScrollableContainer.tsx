import React from "react";

export function ScrollableContainer({
  children,
  maxHeight = 250,
}: {
  children: React.ReactNode;
  maxHeight: number;
}) {
  return (
    <div
      className="overflow-scroll w-full bg-white"
      style={{
        maxHeight: `${maxHeight}px`,
      }}
    >
      {children}
    </div>
  );
}
