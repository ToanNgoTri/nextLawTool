import { processAllLaws } from "../../main";
import { NextResponse } from "next/server";
import { getChunksCollection } from "../../lib/mongoRag";

// ✅ Chỉ chạy khi bấm gọi API
export async function POST(req) {
  const body = await req.json();
  // console.log("🚀 Received request with body:", body);
  const law = body.law || [];
  let result = await processAllLaws(law);
  // console.log(`🎉 Hoàn tất `, result);

  // const result = await processAllLaws(law);

  // Không có gì để lưu, hoặc lưu ít hơn số lượng lẽ ra phải có → coi là lỗi
  if (!result || result.length === 0) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  async function pushLawChunk(lawEmbedding) {
    if (!lawEmbedding || lawEmbedding.length === 0) {
      console.warn("⚠️ Không có chunk nào để push vào MongoDB");
      return false;
    }
    try {
      const col = await getChunksCollection();

      // Upsert theo _id (idempotent). Embedding lưu dạng array để index
      // vector_index (cosine, 1024 chiều) nhận diện được.
      const chunkSize = 500;
      for (let i = 0; i < lawEmbedding.length; i += chunkSize) {
        const slice = lawEmbedding.slice(i, i + chunkSize);
        const ops = slice.map((item) => {
          const _id = item._id ? String(item._id) : crypto.randomUUID();
          const { embedding, _id: _ignore, ...rest } = item;
          const doc = {
            _id,
            ...rest,
            ...(Array.isArray(embedding) && embedding.length ? { embedding } : {}),
          };
          return { replaceOne: { filter: { _id }, replacement: doc, upsert: true } };
        });
        await col.bulkWrite(ops, { ordered: false });
      }

      return true;
    } catch (error) {
      console.error("❌ Error in pushLawChunk:", error);
      return false;
    }
  }

  const ok4 = await pushLawChunk(result);
  return NextResponse.json({ success: ok4 });
}
