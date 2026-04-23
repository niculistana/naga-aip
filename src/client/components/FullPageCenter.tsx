import React from "react";

export function FullPageCenter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50">
      {children}
    </div>
  );
}
