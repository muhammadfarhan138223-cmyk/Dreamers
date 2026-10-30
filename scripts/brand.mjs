import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const mark = `<defs><linearGradient id="b" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#2563ff"/><stop offset="1" stop-color="#56d8ff"/></linearGradient></defs><path fill="url(#b)" d="M22 25q17 0 27 12v42Q39 66 22 67zm32 12Q66 24 82 25v42q-17 0-28 12z"/><path d="M26 83h29c29 0 41-17 41-38 0-10-3-18-9-24" fill="none" stroke="url(#b)" stroke-width="9" stroke-linecap="round"/><path fill="url(#b)" d="m79 4 4 11 12 4-12 4-4 11-4-11-11-4 11-4z"/>`;
const svg = (body, w = 112, h = 100) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;
fs.writeFileSync("public/brand/icon.svg", svg(mark));
fs.writeFileSync("public/brand/favicon.svg", svg(mark));
for (const [variant, color] of [
  ["dark", "#f5f9ff"],
  ["light", "#14213d"],
])
  fs.writeFileSync(
    `public/brand/logo-${variant}.svg`,
    svg(
      mark +
        `<text x="123" y="57" font-family="Arial,sans-serif" font-weight="800" font-size="32" letter-spacing="4" fill="${color}">DREAMERS</text><text x="125" y="78" font-family="Arial,sans-serif" font-size="10" letter-spacing="2" fill="${color}">LEARN. PLAY. UNDERSTAND. ACHIEVE.</text>`,
      430,
    ),
  );
fs.writeFileSync(
  "public/brand/logo-monochrome.svg",
  svg(mark.replaceAll("url(#b)", "currentColor")),
);
for (const size of [192, 512])
  await sharp(
    Buffer.from(
      svg(
        `<rect width="112" height="100" rx="22" fill="#07152f"/><g transform="translate(13 13) scale(.76)">${mark}</g>`,
      ),
    ),
  )
    .resize(size, size)
    .png()
    .toFile(`public/brand/icon-${size}.png`);
await sharp(
  Buffer.from(
    svg(
      `<rect width="112" height="100" fill="#07152f"/><g transform="translate(23 20) scale(.60)">${mark}</g>`,
    ),
  ),
)
  .resize(512, 512)
  .png()
  .toFile("public/brand/maskable-512.png");
fs.writeFileSync(
  "public/brand/splash.svg",
  svg(
    `<rect width="430" height="100" fill="#07152f"/>` +
      mark +
      `<text x="125" y="60" font-family="Arial" font-weight="800" font-size="32" fill="#f5f9ff">DREAMERS</text>`,
    430,
  ),
);
