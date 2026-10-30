import fs from "node:fs";
import path from "node:path";
const root = path.resolve("node_modules/pdfjs-dist");
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);
const target = path.resolve("public/pdf-worker", pkg.version);
fs.mkdirSync(target, { recursive: true });
for (const name of ["pdf.worker.min.mjs"])
  fs.copyFileSync(
    path.join(root, "legacy/build", name),
    path.join(target, name),
  );
for (const directory of ["cmaps", "standard_fonts", "wasm"])
  if (fs.existsSync(path.join(root, directory)))
    fs.cpSync(path.join(root, directory), path.join(target, directory), {
      recursive: true,
    });
fs.copyFileSync(path.join(root, "LICENSE"), path.join(target, "LICENSE"));
console.log(
  `Prepared local PDF.js ${pkg.version} worker and supporting assets.`,
);

const files = fs
  .readdirSync(target, { recursive: true })
  .filter(
    (name) =>
      fs.statSync(path.join(target, name)).isFile() && name !== "assets.json",
  );
fs.writeFileSync(
  path.join(target, "assets.json"),
  JSON.stringify({
    version: pkg.version,
    bytes: files.reduce(
      (sum, name) => sum + fs.statSync(path.join(target, name)).size,
      0,
    ),
    files,
  }),
);
