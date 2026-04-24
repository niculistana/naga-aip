import { type ReactNode, Children } from "react";
import { useNavigate, useLocation } from "react-router";
export const NavWithContentSideBySideLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [nav, content] = Children.toArray(children);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/home";
  return (
    <div>
      <div className="grid grid-flow-row md:grid-flow-col md:grid-cols-[240px_1fr]">
        <div className="flex flex-col order-last md:order-first">
          {nav}
          {!isHome && (
            <div className="pt-2 mt-2">
              <button
                type="button"
                className="text-blue-600 hover:underline mb-4"
                onClick={() => navigate(-1)}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
        {content && (
          <div className="flex justify-center place-self-center md:min-w-2xl md:max-w-3xl">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};
