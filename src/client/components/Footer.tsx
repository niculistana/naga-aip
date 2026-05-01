import React from "react";

export const Footer: React.FC = () => (
  <footer className="w-full h-16 flex items-center justify-center align-middle bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500 relative">
    © {new Date().getFullYear()} Naga AIP 2026 Dashboard. All rights reserved.
  </footer>
);
