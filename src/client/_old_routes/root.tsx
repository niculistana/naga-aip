import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div>
      {/* Common layout or navigation can go here */}
      <Outlet />
    </div>
  );
}
