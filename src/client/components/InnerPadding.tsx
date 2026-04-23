import React from "react";

export function InnerPadding({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 md:p-10 lg:p-16 w-full bg-white shadow-md">
      {children}
    </div>
  );
}
