import { initializeApp, cert } from 'firebase-admin/app';
import admin from 'firebase-admin';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createReadStream } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
import serviceAccount from'./project2-197c0-firebase-adminsdk-wgo9a-9bd9f780ef.json' with { type: "json" } ;;

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

admin.initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://project2-197c0-default-rtdb.firebaseio.com',
});


// console.log('private_key length:', serviceAccount.private_key?.length);
// console.log('has newlines:', serviceAccount.private_key?.includes('\n'));
// console.log('END line:', serviceAccount.private_key?.slice(-30));
const db = getFirestore();

const dbPath = path.join(process.cwd(), "app/asset/LawMachine.LawChunks.json");

const BATCH_SIZE = 100;
let buffer = [];
let count = 0;

async function commitBuffer() {
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
  count += buffer.length;
  console.log(`✅ ${count} docs imported`);
  buffer = [];
  await new Promise((r) => setTimeout(r, 100));
}

async function importData() {
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
        await commitBuffer();
      }
      pipeline.resume();
    });

    pipeline.on("end", async () => {
      if (buffer.length > 0) await commitBuffer();
      resolve();
    });

    pipeline.on("error", reject);
  });

  console.log("🎉 Import xong!");
  process.exit(0);
}

importData().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});