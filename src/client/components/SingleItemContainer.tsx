import React from "react";

export function SingleItemContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-[300px] sm:max-w-[500px] w-full">{children}</div>
  );
}
