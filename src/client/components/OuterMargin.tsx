import React from "react";

export function OuterMargin({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>;
}
