import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export const ApiDocsPage = () => (
  <div className="h-full w-full">
    <SwaggerUI url="/openapi.json" />
  </div>
);
