import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";
import { NextResponse } from "next/server";
import { getChunksCollection } from "../../lib/mongoRag";

// Import file JSON lớn (app/asset/LawMachine.LawChunks.json) vào MongoDB
// (ragdb.chunks). Trước đây đích là Firestore; nay đã đổi sang MongoDB.
const BATCH_SIZE = 500;
const CHECKPOINT_DIR = path.join(process.cwd(), "app/asset");
const CHECKPOINT_PATH = path.join(CHECKPOINT_DIR, ".import-checkpoint.json");

console.log("📂 process.cwd():", process.cwd());
console.log("📂 CHECKPOINT_PATH:", CHECKPOINT_PATH);

// ---------- Checkpoint helpers (local file) ----------

async function getCheckpoint() {
  try {
    const raw = await fs.readFile(CHECKPOINT_PATH, "utf-8");
    console.log("📄 Checkpoint file content:", raw);
    const parsed = JSON.parse(raw);
    console.log("✅ Đọc checkpoint thành công:", parsed);
    return parsed;
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("ℹ️ Không tìm thấy file checkpoint tại:", CHECKPOINT_PATH, "-> bắt đầu từ đầu.");
    } else {
      // Lỗi khác ENOENT (vd: JSON hỏng, quyền truy cập...) cần biết rõ để fix
      console.error("⚠️ Lỗi khi đọc checkpoint (không phải do file không tồn tại):", err);
    }
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

  // Đảm bảo thư mục tồn tại trước khi ghi (tránh lỗi ENOENT khi ghi file)
  await fs.mkdir(CHECKPOINT_DIR, { recursive: true });

  const tmpPath = CHECKPOINT_PATH + ".tmp";
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(tmpPath, json, "utf-8");

  // Trên Windows, fs.rename đôi khi báo lỗi EPERM tạm thời do antivirus
  // hoặc tiến trình khác đang khóa file trong tích tắc. Thử lại vài lần
  // trước khi fallback sang ghi đè trực tiếp.
  const MAX_RETRIES = 5;
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await fs.rename(tmpPath, CHECKPOINT_PATH);
      console.log(`💾 Đã lưu checkpoint -> lastIndex=${lastIndex}, total=${total}, done=${done}`);
      return;
    } catch (err) {
      lastErr = err;
      if (err.code === "EPERM" || err.code === "EBUSY") {
        await new Promise((r) => setTimeout(r, 100 * attempt)); // chờ rồi thử lại
        continue;
      }
      throw err; // lỗi khác EPERM/EBUSY thì không retry, ném luôn
    }
  }

  // Hết số lần retry mà vẫn lỗi -> fallback ghi đè trực tiếp (kém an toàn hơn
  // 1 chút nếu process bị kill đúng lúc đang ghi, nhưng vẫn tốt hơn là crash)
  console.warn(
    `⚠️ fs.rename thất bại sau ${MAX_RETRIES} lần thử (${lastErr?.code}), fallback ghi đè trực tiếp...`
  );
  try {
    await fs.writeFile(CHECKPOINT_PATH, json, "utf-8");
    await fs.unlink(tmpPath).catch(() => {}); // dọn file tmp nếu còn sót
    console.log(`💾 Đã lưu checkpoint (fallback) -> lastIndex=${lastIndex}, total=${total}, done=${done}`);
  } catch (fallbackErr) {
    // Vẫn lỗi -> không throw để tránh làm sập cả import (data đã commit
    // vào Firestore an toàn rồi, chỉ checkpoint bị trễ 1 nhịp)
    console.error(`❌ Không thể lưu checkpoint kể cả fallback:`, fallbackErr);
  }
}

async function resetCheckpoint() {
  try {
    await fs.unlink(CHECKPOINT_PATH);
    console.log("🗑️ Đã xóa checkpoint cũ.");
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("⚠️ Lỗi khi xóa checkpoint:", err);
    }
  }
}

// ---------- Import logic ----------

// Kiểm tra document có hợp lệ để import hay không
// (Firestore không cho phép vector rỗng -> phải lọc trước khi gửi lên)
function isValidDoc(doc) {
  if (!doc || !doc._id) return false;
  if (!Array.isArray(doc.embedding) || doc.embedding.length === 0) return false;
  return true;
}

function buildDocData(doc) {
  return {
    _id: doc._id,
    lawId: doc.lawId ?? null,
    lawdateSign: doc.lawdateSign ?? null,
    lawDayActive: doc.lawDayActive ?? null,
    lawDescription: doc.lawDescription ?? null,
    article: doc.article ?? null,
    fullText: doc.fullText ?? null,
    textChunk: doc.textChunk ?? null,
    embedding: doc.embedding, // Mongo lưu vector dạng array
  };
}

// Commit một mảng docs bằng bulkWrite (upsert theo _id). Nếu gặp lỗi,
// tự động chia đôi để cô lập đúng document gây lỗi rồi bỏ qua riêng nó,
// thay vì để cả batch (hoặc cả pipeline) bị sập.
async function commitChunk(docs) {
  if (docs.length === 0) return 0;

  const col = await getChunksCollection();
  const ops = docs.map((doc) => {
    const data = buildDocData(doc);
    return { replaceOne: { filter: { _id: data._id }, replacement: data, upsert: true } };
  });

  try {
    await col.bulkWrite(ops, { ordered: false });
    return docs.length;
  } catch (err) {
    // Còn nhiều hơn 1 doc -> chia đôi để tìm ra (các) doc gây lỗi
    if (docs.length > 1) {
      console.warn(
        `⚠️ Batch ${docs.length} docs gặp lỗi (${err.details ?? err.message}), chia đôi và thử lại...`
      );
      const mid = Math.floor(docs.length / 2);
      const firstHalf = await commitChunk(docs.slice(0, mid));
      const secondHalf = await commitChunk(docs.slice(mid));
      return firstHalf + secondHalf;
    }

    // Chỉ còn 1 doc mà vẫn lỗi -> doc này có vấn đề (quá lớn, dữ liệu sai...),
    // log lại rồi bỏ qua để không chặn toàn bộ quá trình import
    console.error(
      `❌ Bỏ qua document _id=${docs[0]._id} do lỗi: ${err.details ?? err.message}`
    );
    return 0;
  }
}

async function commitBuffer(buffer) {
  return commitChunk(buffer);
}

async function importData(dbPath, startIndex, initialCount = 0) {
  let buffer = [];
  let bufferLastIndex = startIndex;
  let count = initialCount; // bắt đầu từ tổng đã có ở checkpoint, không phải 0
  let skipped = 0;

  await new Promise((resolve, reject) => {
    const pipeline = chain([
      createReadStream(dbPath),
      parser(),
      streamArray(),
    ]);

    pipeline.on("data", async ({ key, value }) => {
      // ⚠️ stream-json's streamArray trả về field "key", KHÔNG PHẢI "index".
      // Dùng nhầm "index" sẽ luôn ra undefined -> checkpoint không bao giờ
      // tăng lên -> mỗi lần resume đều coi như "Bắt đầu từ đầu".
      const index = key;

      // Bỏ qua các record đã import ở lần chạy trước
      if (index <= startIndex) {
        // Log định kỳ để biết tiến trình vẫn đang chạy, không bị "đứng im"
        if (index % 10000 === 0) {
          console.log(`⏳ Đang đọc qua các record cũ... (index=${index} / startIndex=${startIndex})`);
        }
        return;
      }

      // Document không hợp lệ (vd: thiếu _id, embedding rỗng) -> bỏ qua luôn,
      // không đẩy vào buffer, tránh lãng phí thời gian chia nhỏ batch sau này
      if (!isValidDoc(value)) {
        skipped++;
        console.warn(
          `⏭️ Bỏ qua document không hợp lệ tại index=${index} (_id=${value?._id ?? "?"}, embedding length=${value?.embedding?.length ?? "n/a"})`
        );
        bufferLastIndex = index;
        pipeline.resume();
        return;
      }

      pipeline.pause();
      buffer.push(value);
      bufferLastIndex = index;

      if (buffer.length >= BATCH_SIZE) {
        try {
          const imported = await commitBuffer(buffer);
          count += imported;
          // Lưu checkpoint ngay sau mỗi batch commit thành công
          await saveCheckpoint(bufferLastIndex, count);
          console.log(`✅ ${count} docs imported (index=${bufferLastIndex}, bỏ qua=${skipped})`);
          buffer = [];
        } catch (err) {
          console.error(`❌ Lỗi tại index=${bufferLastIndex}, đã lưu checkpoint trước đó (total=${count})`);
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
        console.log(`🏁 Hoàn tất: ${count} docs imported, ${skipped} docs bị bỏ qua (không hợp lệ).`);
        resolve({ count, skipped });
      } catch (err) {
        reject(err);
      }
    });

    pipeline.on("error", reject);
  });

  return { count, skipped };
}

// ✅ GET /api/import-law-chunks
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

    const startTotal = checkpoint.total ?? 0;
    const result = await importData(dbPath, checkpoint.lastIndex, startTotal);
    const newlyImported = result.count - startTotal;

    return NextResponse.json({
      success: true,
      message: `🎉 Import xong! Lần này import thêm ${newlyImported} docs (bỏ qua ${result.skipped} docs không hợp lệ). Tổng cộng dồn: ${result.count} docs.`,
    });
  } catch (error) {
    console.error("❌ Lỗi:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}