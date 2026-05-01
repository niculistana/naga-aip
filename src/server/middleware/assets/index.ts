import { buildPath, assetsFolder } from "../../util.js";
import fs from "fs";
import path from "path";
import express from "express";

const assetsPath = path.join(buildPath, assetsFolder);
if (!fs.existsSync(assetsPath)) {
  throw new Error(
    `Assets not found under ${assetsPath}. Please run the build command before starting the server.`,
  );
}

export const getStaticAssets: ReturnType<typeof express.static> =
  express.static(assetsPath);
