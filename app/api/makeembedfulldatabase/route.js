// scripts/extractLawChunks.js
import fs, { createReadStream } from "fs";
import path from "path";
import { chain } from "stream-chain";
import { parser } from "stream-json";
const {streamArray} = require('stream-json/streamers/stream-array.js');
import { processAllLaws } from "../../main";
import { NextResponse } from "next/server";

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

// ❌ Xóa main() tự chạy — gây duplicate khi Next.js import file

// ✅ Chỉ chạy khi bấm gọi API
export async function GET() {
  const laws = await loadDatabase();
  await processAllLaws(laws);  // readCheckpoint() tự đọc file → resume đúng chỗ
  return NextResponse.json({ ok: true });
}