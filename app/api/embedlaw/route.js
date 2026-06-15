const { streamArray } = require("stream-json/streamers/stream-array.js");
import { processAllLaws } from "../../main";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const client = new MongoClient(process.env.MONGODB_URI);

// ✅ Chỉ chạy khi bấm gọi API
export async function POST(req) {

  const body = await req.json();
  // console.log("🚀 Received request with body:", body);
  const law = body.law || [];
  let result = await processAllLaws(law);
  // console.log(`🎉 Hoàn tất `,result);


    async function pushLawChunk(lawEmbedding) {
    // console.log("Pushing law chunks to MongoDB...", lawEmbedding);
    try {
      const database = client.db("LawMachine");
      const LawContent = database.collection("LawChunks");
      await LawContent.insertMany(lawEmbedding);
      return true;
    } catch (error) {
      console.error("❌ Error in pushLawSearchDescription:", error);
      return false;
    }
  }

    const ok4 = await pushLawChunk(result);
  return NextResponse.json({  success: ok4 });
}
