import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const client = new MongoClient(process.env.MONGODB_URI);

export async function POST(req) {
  const body = await req.json();

  async function pushLawContent(info, content, id) {
    try {
      const database = client.db("LawMachine");
      const LawContent = database.collection("LawCollection");
      await LawContent.insertOne({ _id: id, info, content });
      return true;
    } catch (error) {
      console.error("❌ Error in pushLawContent:", error);
      return false;
    }
  }

  async function pushLawSearch(info, id, fullText) {
    try {
      const database = client.db("LawMachine");
      const LawContent = database.collection("LawSearchContent");
      await LawContent.insertOne({
        _id: id,
        info: {
          lawNumber: info["lawNumber"],
          lawDescription: info["lawDescription"],
          lawNameDisplay: info["lawNameDisplay"],
          lawDaySign: info["lawDaySign"],
          lawDayActive: info["lawDayActive"],
        },
        fullText,
      });
      return true;
    } catch (error) {
      console.error("❌ Error in pushLawSearch:", error);
      return false;
    }
  }

  async function pushLawSearchDescription(info, id) {
    try {
      const database = client.db("LawMachine");
      const LawContent = database.collection("LawSearchDescription");
      await LawContent.insertOne({
        _id: id,
        info: {
          lawDescription: info["lawDescription"],
          lawNameDisplay: info["lawNameDisplay"],
          lawDaySign: info["lawDaySign"],
          lawDayActive: info["lawDayActive"],
        },
      });
      return true;
    } catch (error) {
      console.error("❌ Error in pushLawSearchDescription:", error);
      return false;
    }
  }

  // async function pushLawChunk(lawEmbedding) {
  //   console.log("Pushing law chunks to MongoDB...", lawEmbedding);
  //   try {
  //     const database = client.db("LawMachine");
  //     const LawContent = database.collection("LawChunks");
  //     await LawContent.insertMany(lawEmbedding);
  //     return true;
  //   } catch (error) {
  //     console.error("❌ Error in pushLawSearchDescription:", error);
  //     return false;
  //   }
  // }

  // // 🔹 Thực thi 4 thao tác
  const ok1 = await pushLawContent(body.lawInfo, body.dataLaw, body.lawNumberForPush);
  const ok2 = await pushLawSearch(
    body.lawInfo,
    body.lawNumberForPush,
    body.contentText
  );
  const ok3 = await pushLawSearchDescription(body.lawInfo, body.lawNumberForPush);

  // const ok4 = await pushLawChunk(body.dataEmbedding);
  const success = ok1 && ok2 && ok3 
  // && ok4;
  // 🔹 Gửi kết quả ra client
  return NextResponse.json({
    success,
    data: body,
  });
}
