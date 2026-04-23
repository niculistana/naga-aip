import React from "react";

export function ScrollableContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="overflow-scroll w-full">{children}</div>;
}
