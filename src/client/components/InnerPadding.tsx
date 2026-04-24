import React from "react";

export function InnerPadding({ children }: { children: React.ReactNode }) {
  return <div className="p-6 md:p-10 md:pt-4 w-full">{children}</div>;
}
