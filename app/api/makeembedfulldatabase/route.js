// scripts/extractLawChunks.js
import fs, { createReadStream } from "fs";
import path from "path";
import { chain } from "stream-chain";
import { parser } from "stream-json";
const {streamArray} = require('stream-json/streamers/stream-array.js');
import {  processAllLaws } from "../../main";

const dbPath = path.join(process.cwd(), "app/asset/LawMachine.LawCollection.json");

function loadDatabase() {
  return new Promise((resolve, reject) => {
    const results = [];
    const pipeline = chain([
      createReadStream(dbPath),
      parser(),
      streamArray(),
    ]);
    pipeline.on("data", ({ value }) => results.push(value));
    pipeline.on("end",  () => resolve(results));
    pipeline.on("error", (err) => reject(err));
  });
}

// =========================
// MAIN
// =========================

async function main() {
  const laws = await loadDatabase();
  console.log(`📚 Total laws: ${laws.length}`);

  await processAllLaws(laws);  // ← toàn bộ logic checkpoint, embed, insert đều ở đây
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// =========================
// NEXT API (giữ lại nếu muốn trigger qua browser)
// =========================

export async function GET() {
  const laws = await loadDatabase();
  await processAllLaws(laws);
  return NextResponse.json({ ok: true });
}