import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="h-24 w-full bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="flex flex-row">
        <img className="h-12" src="/naga-seal.png" />
        <div className="text-xl font-bold text-blue-700 tracking-tight place-content-center">
          Naga AIP 2026 Dashboard
        </div>
      </div>
    </header>
  );
};
