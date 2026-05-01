import fs from "fs";
import { pathToFileURL } from "url";
import type { ServerBuild } from "react-router";
import { createRequestHandler } from "@react-router/express";
import { serverPath } from "../../util";

if (!fs.existsSync(serverPath)) {
  throw new Error(
    `Server file not found under ${serverPath}. Please run the build command before starting the server.`,
  );
}
export const ssrHandlerPromise = async () => {
  if (fs.existsSync(serverPath)) {
    const importedBuild = (await import(
      pathToFileURL(serverPath).href
    )) as Record<string, unknown>;

    const serverBuild =
      ((importedBuild.default ?? importedBuild) as ServerBuild) ||
      importedBuild;

    return createRequestHandler({
      build: serverBuild,
      mode:
        process.env.NODE_ENV === "development" ? "development" : "production",
    });
  }

  return null;
};
