// scripts/firestoreToMongo.mjs
//
// Materialize TOÀN BỘ collection `chunks` hiện có trên Firestore thành 1 file
// app/asset/firestore-chunks.jsonl rồi đẩy vào MongoDB ragdb.chunks.
//
// Vì link tới Firestore rất chậm (~0.35 MB/s) mà toàn bộ dữ liệu ~5.5GB
// (chủ yếu là vector embedding), tải trực tiếp sẽ mất nhiều giờ. File local
// app/asset/LawMachine.LawChunks.json đã chứa phần lớn dữ liệu này với nội
// dung GIỐNG HỆT Firestore (đã đối chiếu embedding + fullText). Do đó:
//
//   1) fetch-ids : lấy danh sách ID hiện có trên Firestore (nhẹ, ~2 phút).
//   2) build     : - stream file local, record nào có ID thuộc Firestore thì
//                    ghi thẳng vào firestore-chunks.jsonl (dùng lại data local).
//                  - các ID Firestore có mà local THIẾU -> tải riêng từ Firestore
//                    (getAll theo lô) rồi append. => file = đúng tập Firestore.
//   3) push      : stream firestore-chunks.jsonl -> upsert vào ragdb.chunks.
//
// Chạy:
//   node scripts/firestoreToMongo.mjs            # chạy cả 3 bước
//   node scripts/firestoreToMongo.mjs fetch-ids
//   node scripts/firestoreToMongo.mjs build
//   node scripts/firestoreToMongo.mjs push
//   node scripts/firestoreToMongo.mjs --reset ...

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import readline from "readline";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldPath } from "firebase-admin/firestore";
import { MongoClient } from "mongodb";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";

// ----------------------------- config -----------------------------
const MONGO_URI =
  "mongodb://root:sebHiv-sekdup-gymfu1@46.225.145.42:27017/ragdb?authSource=admin&directConnection=true";
const MONGO_DB = "ragdb";
const MONGO_COLLECTION = "chunks";
const FIRESTORE_COLLECTION = "chunks";

const ASSET_DIR = path.join(process.cwd(), "app/asset");
const LOCAL_FILE = path.join(ASSET_DIR, "LawMachine.LawChunks.json");
const OUT_FILE = path.join(ASSET_DIR, "firestore-chunks.jsonl");
const IMPORT_FILE = path.join(ASSET_DIR, "firestore-chunks.import.jsonl");
const IDS_FILE = path.join(ASSET_DIR, "firestore-ids.json");
const MISSING_FILE = path.join(ASSET_DIR, "firestore-missing-ids.json");
const BUILD_CK = path.join(ASSET_DIR, ".build-checkpoint.json");
const PUSH_CK = path.join(ASSET_DIR, ".push-checkpoint.json");

const ID_PAGE = 5000; // ids / trang khi liệt kê document id
const GETALL_BATCH = 200; // docs / lô khi tải các doc còn thiếu
const MONGO_BATCH = 500; // docs / bulkWrite

// --------------------------- env loader ---------------------------
function loadEnv(file) {
  const txt = fs.readFileSync(file, "utf-8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2];
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
loadEnv(path.join(process.cwd(), ".env.local"));

// --------------------------- firestore ----------------------------
function initFirestore() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}
function embToArray(emb) {
  if (emb == null) return null;
  if (typeof emb.toArray === "function") return emb.toArray();
  if (Array.isArray(emb)) return emb;
  return null;
}
// Chuẩn hoá 1 record (từ Firestore doc hoặc từ object local) về đúng schema
function normalize(id, d) {
  return {
    _id: id,
    lawId: d.lawId ?? null,
    lawdateSign: d.lawdateSign ?? null,
    lawDayActive: d.lawDayActive ?? null,
    lawDescription: d.lawDescription ?? null,
    article: d.article ?? null,
    fullText: d.fullText ?? null,
    textChunk: d.textChunk ?? null,
    embedding: embToArray(d.embedding),
  };
}

// --------------------------- helpers ------------------------------
async function readJson(file, fallback) {
  try {
    return JSON.parse(await fsp.readFile(file, "utf-8"));
  } catch {
    return fallback;
  }
}
async function writeJson(file, data) {
  const tmp = file + ".tmp";
  await fsp.writeFile(tmp, JSON.stringify(data), "utf-8");
  try {
    await fsp.rename(tmp, file);
  } catch {
    await fsp.writeFile(file, JSON.stringify(data), "utf-8");
    await fsp.unlink(tmp).catch(() => {});
  }
}

// ===================== PHASE 1: FETCH-IDS ==========================
async function fetchIds() {
  const existing = await readJson(IDS_FILE, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    console.log(`✅ Đã có ${existing.length} ids trong ${path.basename(IDS_FILE)} (bỏ qua fetch).`);
    return existing;
  }
  const fdb = initFirestore();
  const total = (await fdb.collection(FIRESTORE_COLLECTION).count().get()).data().count;
  console.log(`🔥 Firestore '${FIRESTORE_COLLECTION}' có ${total} docs. Đang lấy danh sách ID...`);

  const ids = [];
  let last = null;
  while (true) {
    let q = fdb.collection(FIRESTORE_COLLECTION).select().orderBy(FieldPath.documentId()).limit(ID_PAGE);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;
    for (const d of snap.docs) ids.push(d.id);
    last = snap.docs[snap.docs.length - 1].id;
    console.log(`  ...${ids.length}/${total} ids`);
    if (snap.size < ID_PAGE) break;
  }
  await writeJson(IDS_FILE, ids);
  console.log(`🏁 Đã lưu ${ids.length} ids -> ${path.basename(IDS_FILE)}`);
  return ids;
}

// ===================== PHASE 2: BUILD ==============================
async function build() {
  const ids = await fetchIds();
  const S = new Set(ids);

  const ck = await readJson(BUILD_CK, { localDone: false, missingPushed: 0, done: false });
  if (ck.done) {
    console.log(`✅ Build đã hoàn tất trước đó -> ${path.basename(OUT_FILE)}`);
    return;
  }

  // ---- 2a) stream file local, ghi các record có id thuộc Firestore ----
  if (!ck.localDone) {
    if (!fs.existsSync(LOCAL_FILE)) throw new Error(`Không thấy ${LOCAL_FILE}`);
    console.log(`📖 Stream file local, ghi record có id ∈ Firestore -> ${path.basename(OUT_FILE)} ...`);

    const missing = new Set(S); // sẽ còn lại các id Firestore mà local KHÔNG có
    const out = fs.createWriteStream(OUT_FILE, { flags: "w" });
    let seen = 0, written = 0, notInFs = 0;

    await new Promise((resolve, reject) => {
      const pipeline = chain([fs.createReadStream(LOCAL_FILE), parser(), streamArray()]);
      pipeline.on("data", ({ value }) => {
        seen++;
        const id = value?._id;
        if (id && S.has(id)) {
          missing.delete(id);
          const ok = out.write(JSON.stringify(normalize(id, value)) + "\n");
          written++;
          if (!ok) {
            pipeline.pause();
            out.once("drain", () => pipeline.resume());
          }
        } else if (id) {
          notInFs++; // id local không còn trên Firestore -> bỏ (đã bị xoá)
        }
        if (seen % 50000 === 0) console.log(`  đọc ${seen} record local, đã ghi ${written}...`);
      });
      pipeline.on("end", () => out.end(resolve));
      pipeline.on("error", reject);
    });

    const missingIds = [...missing];
    await writeJson(MISSING_FILE, missingIds);
    console.log(
      `✅ Local xong: đọc ${seen}, ghi ${written} (bỏ ${notInFs} id đã xoá khỏi Firestore). ` +
        `Còn ${missingIds.length} id Firestore cần tải riêng.`
    );
    ck.localDone = true;
    ck.missingPushed = 0;
    await writeJson(BUILD_CK, ck);
  }

  // ---- 2b) tải các doc còn thiếu từ Firestore rồi append ----
  const missingIds = await readJson(MISSING_FILE, []);
  if (missingIds.length === 0) {
    console.log("✅ Không có doc nào thiếu, file đã đầy đủ.");
  } else {
    const start = ck.missingPushed || 0;
    console.log(`⬇️  Tải ${missingIds.length} doc còn thiếu từ Firestore (đã có ${start})...`);
    const fdb = initFirestore();
    const col = fdb.collection(FIRESTORE_COLLECTION);
    const out = fs.createWriteStream(OUT_FILE, { flags: "a" });
    const writeStr = (s) => new Promise((res, rej) => out.write(s, (e) => (e ? rej(e) : res())));

    let done = start;
    for (let i = start; i < missingIds.length; i += GETALL_BATCH) {
      const slice = missingIds.slice(i, i + GETALL_BATCH);
      const refs = slice.map((id) => col.doc(id));
      const snaps = await fdb.getAll(...refs);
      let buf = "";
      for (const s of snaps) {
        if (!s.exists) continue;
        buf += JSON.stringify(normalize(s.id, s.data())) + "\n";
      }
      if (buf) await writeStr(buf);
      done += slice.length;
      ck.missingPushed = done;
      await writeJson(BUILD_CK, ck);
      console.log(`  ⬇️  ${done}/${missingIds.length} doc thiếu đã tải`);
    }
    await new Promise((res) => out.end(res));
  }

  ck.done = true;
  await writeJson(BUILD_CK, ck);
  console.log(`🏁 Build xong -> ${path.basename(OUT_FILE)}`);
}

// ===================== PHASE 3: PUSH ===============================
// Giữ nguyên schema Firestore gốc (textChunk + fullText); KHÔNG thêm field `text`.
function toMongoDoc(rec) {
  return rec;
}

// ============ PREP-IMPORT: tạo file JSONL sẵn cho Compass ==========
// Đọc firestore-chunks.jsonl, thêm field `text` (= textChunk||fullText),
// ghi ra firestore-chunks.import.jsonl để import thẳng bằng MongoDB Compass.
async function prepImport() {
  if (!fs.existsSync(OUT_FILE)) throw new Error(`Không thấy ${OUT_FILE}. Chạy 'build' trước.`);
  console.log(`🛠️  Tạo file import-ready (thêm field 'text') -> ${path.basename(IMPORT_FILE)} ...`);

  const out = fs.createWriteStream(IMPORT_FILE, { flags: "w" });
  const rl = readline.createInterface({ input: fs.createReadStream(OUT_FILE), crlfDelay: Infinity });
  let n = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }
    const ok = out.write(JSON.stringify(toMongoDoc(rec)) + "\n");
    n++;
    if (!ok) await new Promise((r) => out.once("drain", r));
    if (n % 50000 === 0) console.log(`  ...${n} docs`);
  }
  await new Promise((res) => out.end(res));
  console.log(`🏁 Xong: ${n} docs -> ${IMPORT_FILE}`);
}

async function push() {
  if (!fs.existsSync(OUT_FILE)) throw new Error(`Không thấy ${OUT_FILE}. Chạy 'build' trước.`);
  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 120000,
    connectTimeoutMS: 60000,
    retryWrites: true,
    maxPoolSize: 5,
  });
  await client.connect();
  const col = client.db(MONGO_DB).collection(MONGO_COLLECTION);
  console.log(`🍃 Kết nối MongoDB ${MONGO_DB}.${MONGO_COLLECTION}`);

  const ck = await readJson(PUSH_CK, { pushed: 0, done: false });
  if (ck.done) {
    console.log(`✅ Push đã hoàn tất trước đó (${ck.pushed} docs).`);
    await client.close();
    return;
  }
  const already = ck.pushed;
  console.log(already > 0 ? `▶️ Resume push: bỏ qua ${already} dòng đầu.` : "▶️ Bắt đầu push.");

  let index = 0;
  let buffer = [];
  const flush = async () => {
    if (!buffer.length) return;
    const ops = buffer.map((d) => ({
      replaceOne: { filter: { _id: d._id }, replacement: d, upsert: true },
    }));
    // Retry với backoff khi gặp lỗi mạng tạm thời (timeout, mất kết nối...)
    const MAX = 6;
    for (let attempt = 1; ; attempt++) {
      try {
        await col.bulkWrite(ops, { ordered: false });
        break;
      } catch (err) {
        if (attempt >= MAX) throw err;
        const wait = Math.min(30000, 1000 * 2 ** attempt);
        console.warn(`  ⚠️ bulkWrite lỗi (lần ${attempt}/${MAX}): ${err.message}. Chờ ${wait}ms rồi thử lại...`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
    buffer = [];
    await writeJson(PUSH_CK, { pushed: index, done: false });
  };

  const rl = readline.createInterface({ input: fs.createReadStream(OUT_FILE), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    index++;
    if (index <= already) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      console.warn(`  ⚠️ dòng ${index} lỗi JSON, bỏ qua.`);
      continue;
    }
    buffer.push(toMongoDoc(rec));
    if (buffer.length >= MONGO_BATCH) {
      await flush();
      if (index % 10000 === 0) console.log(`  ⬆️  đã push ${index} docs`);
    }
  }
  await flush();
  await writeJson(PUSH_CK, { pushed: index, done: true });

  const finalCount = await col.estimatedDocumentCount();
  console.log(`🏁 Push xong: ${index} docs. ragdb.${MONGO_COLLECTION} hiện có ~${finalCount} docs.`);
  await client.close();
}

// ------------------------------ main ------------------------------
const args = process.argv.slice(2);
const reset = args.includes("--reset");
const phase = args.find((a) => !a.startsWith("--")) || "all";

if (reset) {
  for (const f of [IDS_FILE, MISSING_FILE, BUILD_CK, PUSH_CK]) await fsp.unlink(f).catch(() => {});
  console.log("🔄 Đã xoá checkpoint/ids.");
}

try {
  if (phase === "fetch-ids") await fetchIds();
  else if (phase === "build") await build();
  else if (phase === "prep-import") await prepImport();
  else if (phase === "push") await push();
  else {
    await build();
    await push();
  }
  console.log("✅ HOÀN TẤT.");
  process.exit(0);
} catch (err) {
  console.error("❌ LỖI:", err);
  process.exit(1);
}
