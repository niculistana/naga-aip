import React from "react";

export function OuterMargin({ children }: { children: React.ReactNode }) {
  return <div className="p-4 md:p-8 lg:p-12 w-full">{children}</div>;
}
