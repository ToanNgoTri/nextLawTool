import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createReadStream } from "fs";
import path from "path";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";
import { NextResponse } from "next/server";

// ✅ Khởi tạo Firebase Admin chỉ 1 lần (tránh lỗi re-init khi hot reload)

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

async function importData(dbPath) {
  let buffer = [];
  let count = 0;

  await new Promise((resolve, reject) => {
    const pipeline = chain([
      createReadStream(dbPath),
      parser(),
      streamArray(),
    ]);

    pipeline.on("data", async ({ value }) => {
      pipeline.pause();
      buffer.push(value);

      if (buffer.length >= BATCH_SIZE) {
        try {
          const imported = await commitBuffer(buffer);
          count += imported;
          console.log(`✅ ${count} docs imported`);
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
        }
        resolve(count);
      } catch (err) {
        reject(err);
      }
    });

    pipeline.on("error", reject);
  });

  return count;
}

// ✅ Gọi API: POST /api/import-law-chunks
export async function GET(req) {
  try {
    const dbPath = path.join(
      process.cwd(),
      "app/asset/LawMachine.LawChunks.json"
    );

    const totalImported = await importData(dbPath);

    return NextResponse.json({
      success: true,
      message: `🎉 Import xong! Tổng cộng ${totalImported} docs`,
    });
  } catch (error) {
    console.error("❌ Lỗi:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}