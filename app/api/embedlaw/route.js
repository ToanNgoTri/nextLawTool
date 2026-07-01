import { processAllLaws } from "../../main";
import { NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ✅ Khởi tạo Firebase Admin chỉ 1 lần
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
      console.warn("⚠️ Không có chunk nào để push vào Firestore");
      return false;
    }
    try {
      const colRef = db.collection("chunks");

      // Firestore batch giới hạn 500 thao tác/lần -> chia nhỏ
      const chunkSize = 500;
      for (let i = 0; i < lawEmbedding.length; i += chunkSize) {
        const batch = db.batch();
        const chunk = lawEmbedding.slice(i, i + chunkSize);

        chunk.forEach((item) => {
          const docRef = item._id ? colRef.doc(String(item._id)) : colRef.doc();

          const { embedding, ...rest } = item;

          batch.set(docRef, {
            ...rest,
            // Nếu có field embedding (vector), dùng FieldValue.vector
            ...(embedding ? { embedding: FieldValue.vector(embedding) } : {}),
          });
        });

        await batch.commit();
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
