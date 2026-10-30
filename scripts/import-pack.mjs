import fs from "node:fs";
import path from "node:path";
import { validatePack } from "../lib/pack-validation.mjs";
const filename = process.argv[2];
if (!filename) {
  console.error("Usage: node scripts/import-pack.mjs FILE.json [--publish]");
  process.exit(1);
}
try {
  const bytes = fs.readFileSync(filename);
  if (bytes.length > 5 * 1024 * 1024)
    throw new Error(
      "Pack exceeds the 5 MB authoring limit. Split it into chapter packs.",
    );
  const pack = JSON.parse(bytes);
  const errors = validatePack(pack);
  if (errors.length) throw new Error(errors.join("\n"));
  if (process.argv.includes("--publish")) {
    const output = path.resolve(
      "public/packs",
      `${pack.id}-v${pack.version}.json`,
    );
    if (fs.existsSync(output))
      throw new Error(
        "Version already exists. Increment its version before publishing.",
      );
    fs.writeFileSync(output, JSON.stringify(pack, null, 2) + "\n");
    console.log(
      `Published ${pack.id} version ${pack.version}. Status: ${pack.verification}. Add it to the download registry after review.`,
    );
  } else
    console.log(
      `Valid: ${pack.id} v${pack.version}, ${pack.lessons.length} lessons, ${pack.questions.length} MCQs. No files published.`,
    );
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
