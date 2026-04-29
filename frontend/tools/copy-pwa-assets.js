import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const frontendRoot = path.resolve(currentDirPath, "..");
const publicDir = path.join(frontendRoot, "public");
const distDir = path.join(frontendRoot, "dist");

const assets = ["pwa-192x192.png", "pwa-512x512.png"];

for (const asset of assets) {
  await fs.copyFile(path.join(publicDir, asset), path.join(distDir, asset));
}

console.log("PWA assets copied to dist.");
