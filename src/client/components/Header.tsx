import React from "react";
import { authClient } from "../lib/auth";
import { useNavigate } from "react-router";

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="h-24 w-full bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="text-xl font-bold text-blue-700 tracking-tight">
        Naga AIP 2026 Dashboard
      </div>
      <button
        onClick={async () => {
          await authClient.signOut();
          navigate("/auth/signin");
        }}
      >
        Sign out
      </button>
    </header>
  );
};
