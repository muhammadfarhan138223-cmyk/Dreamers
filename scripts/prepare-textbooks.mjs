// Materialise owner-curated assets at build time. Never serve arbitrary remote URLs.
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  copyFile,
  unlink,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import {
  HOSTED_BOOKS,
  hostedBookUrl,
  sourceBookUrl,
} from "../lib/hosted-books.mjs";
const directory = resolve("public/textbooks");
await mkdir(directory, { recursive: true });
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function prepare(book) {
  const file = resolve("public" + hostedBookUrl(book.id));
  try {
    if (digest(await readFile(file)) === book.sha256) return;
  } catch {}
  let bytes;
  if (process.env.DREAMERS_BOOK_SOURCE_DIR) {
    bytes = await readFile(
      resolve(process.env.DREAMERS_BOOK_SOURCE_DIR, book.filename),
    );
  } else {
    const url = new URL(sourceBookUrl(book.id));
    if (
      url.protocol !== "https:" ||
      !["cdn.ilmkidunya.com", "www.taleem360.com"].includes(url.hostname)
    )
      throw new Error("Unapproved textbook source");
    let failure;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(90000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const chunks = [];
        let total = 0;
        for await (const chunk of response.body) {
          total += chunk.length;
          if (total > book.bytes)
            throw new Error("Source is larger than registered copy");
          chunks.push(chunk);
        }
        bytes = Buffer.concat(chunks);
        break;
      } catch (e) {
        failure = e;
      }
    }
    if (!bytes)
      throw new Error(`Cannot prepare ${book.id}: ${failure?.message}`);
  }
  if (bytes.length !== book.bytes || digest(bytes) !== book.sha256)
    throw new Error(
      `Textbook integrity mismatch: ${book.id}. Review the edition before publishing.`,
    );
  const temp = file + ".tmp";
  try {
    await writeFile(temp, bytes);
    await rename(temp, file);
  } catch (e) {
    await unlink(temp).catch(() => {});
    throw e;
  }
  console.log(
    `Prepared ${book.id} (${(bytes.length / 1048576).toFixed(1)} MB)`,
  );
}
for (let i = 0; i < HOSTED_BOOKS.length; i += 3)
  await Promise.all(HOSTED_BOOKS.slice(i, i + 3).map(prepare));
console.log(
  `${HOSTED_BOOKS.length} exact supplied books available in this build.`,
);
