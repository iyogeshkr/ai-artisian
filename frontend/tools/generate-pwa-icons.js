import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const frontendRoot = path.resolve(currentDirPath, "..");
const publicDir = path.join(frontendRoot, "public");

const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#ea580c"/>
  <text x="256" y="360" font-size="300" text-anchor="middle"
        fill="white" font-family="Arial" font-weight="bold">A</text>
</svg>`;

const buffer = Buffer.from(svg);

await sharp(buffer).resize(192).png().toFile(path.join(publicDir, "pwa-192x192.png"));
await sharp(buffer).resize(512).png().toFile(path.join(publicDir, "pwa-512x512.png"));

console.log("PWA icons generated.");
