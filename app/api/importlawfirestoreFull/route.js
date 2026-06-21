import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";
import { NextResponse } from "next/server";

console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("KEY starts:", process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30));
console.log("KEY ends:", process.env.FIREBASE_PRIVATE_KEY?.slice(-30));
console.log("Has real newlines:", process.env.FIREBASE_PRIVATE_KEY?.includes("\n"));

if (!getApps().length) {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://project2-197c0-default-rtdb.firebaseio.com",
  });
}

const db = getFirestore();

const BATCH_SIZE = 100;
const CHECKPOINT_PATH = path.join(process.cwd(), "app/asset/.import-checkpoint.json");

// ---------- Checkpoint helpers (local file) ----------

async function getCheckpoint() {
  try {
    const raw = await fs.readFile(CHECKPOINT_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    // Chưa có checkpoint -> bắt đầu từ đầu
    return { lastIndex: -1, total: 0, done: false };
  }
}

async function saveCheckpoint(lastIndex, total, done = false) {
  const data = {
    lastIndex,
    total,
    done,
    updatedAt: new Date().toISOString(),
  };
  // Ghi ra file tạm rồi rename để tránh hỏng file nếu process bị kill giữa chừng
  const tmpPath = CHECKPOINT_PATH + ".tmp";
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmpPath, CHECKPOINT_PATH);
}

async function resetCheckpoint() {
  try {
    await fs.unlink(CHECKPOINT_PATH);
  } catch (err) {
    // không có file thì thôi
  }
}

// ---------- Import logic ----------

async function commitBuffer(buffer) {
  const batch = db.batch();
  for (const doc of buffer) {
    const ref = db.collection("chunks").doc(doc._id);
    batch.set(ref, {
      lawId: doc.lawId ?? null,
      lawdateSign: doc.lawdateSign ?? null,
      lawDayActive: doc.lawDayActive ?? null,
      lawDescription: doc.lawDescription ?? null,
      article: doc.article ?? null,
      fullText: doc.fullText ?? null,
      textChunk: doc.textChunk ?? null,
      embedding: FieldValue.vector(doc.embedding),
    });
  }
  await batch.commit();
  return buffer.length;
}

async function importData(dbPath, startIndex) {
  let buffer = [];
  let bufferLastIndex = startIndex;
  let count = 0;

  await new Promise((resolve, reject) => {
    const pipeline = chain([
      createReadStream(dbPath),
      parser(),
      streamArray(),
    ]);

    pipeline.on("data", async ({ index, value }) => {
      // Bỏ qua các record đã import ở lần chạy trước
      if (index <= startIndex) {
        return;
      }

      pipeline.pause();
      buffer.push(value);
      bufferLastIndex = index;

      if (buffer.length >= BATCH_SIZE) {
        try {
          const imported = await commitBuffer(buffer);
          count += imported;
          await saveCheckpoint(bufferLastIndex, count);
          console.log(`✅ ${count} docs imported (index=${bufferLastIndex})`);
          buffer = [];
        } catch (err) {
          pipeline.destroy();
          return reject(err);
        }
      }
      pipeline.resume();
    });

    pipeline.on("end", async () => {
      try {
        if (buffer.length > 0) {
          const imported = await commitBuffer(buffer);
          count += imported;
          await saveCheckpoint(bufferLastIndex, count);
        }
        await saveCheckpoint(bufferLastIndex, count, true);
        resolve(count);
      } catch (err) {
        reject(err);
      }
    });

    pipeline.on("error", reject);
  });

  return count;
}

// ✅ Gọi API: GET /api/import-law-chunks
//    Resume tự động từ checkpoint file local.
//    Thêm ?reset=true để xóa checkpoint và import lại từ đầu.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const reset = searchParams.get("reset") === "true";

    if (reset) {
      await resetCheckpoint();
      console.log("🔄 Checkpoint đã reset, import lại từ đầu.");
    }

    const checkpoint = await getCheckpoint();

    if (checkpoint.done) {
      return NextResponse.json({
        success: true,
        message: `Import đã hoàn tất trước đó (${checkpoint.total} docs). Gọi với ?reset=true nếu muốn import lại.`,
      });
    }

    const dbPath = path.join(
      process.cwd(),
      "app/asset/LawMachine.LawChunks.json"
    );

    console.log(
      checkpoint.lastIndex >= 0
        ? `▶️ Resume từ index ${checkpoint.lastIndex + 1} (đã có ${checkpoint.total} docs)`
        : "▶️ Bắt đầu import từ đầu"
    );

    const newlyImported = await importData(dbPath, checkpoint.lastIndex);

    return NextResponse.json({
      success: true,
      message: `🎉 Import xong! Đã import thêm ${newlyImported} docs trong lần chạy này.`,
    });
  } catch (error) {
    console.error("❌ Lỗi:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}