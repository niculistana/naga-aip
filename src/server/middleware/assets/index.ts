import { clientPath } from "../../util.js";
import fs from "fs";
import express from "express";
import path from "path";
import type { RequestHandler } from "express";

if (!fs.existsSync(clientPath)) {
  throw new Error(
    `Client files not found under ${clientPath}. Please run the build command before starting the server.`,
  );
}

export const getStaticAssets = (fileOrFolder: string): RequestHandler => {
  return express.static(path.join(clientPath, fileOrFolder));
};
