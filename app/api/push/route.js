import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const client = new MongoClient(
  "mongodb://thuvienphapluat:ZvQn9683p8NnPXFMdR1VX53HTK3Da1WqyXJpvtgMMASTRdDkyu87lFAL7aR5DiiN@188.245.52.121:6980/?directConnection=true"
);

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
        },
      });
      return true;
    } catch (error) {
      console.error("❌ Error in pushLawSearchDescription:", error);
      return false;
    }
  }

  // 🔹 Thực thi 3 thao tác
  const ok1 = await pushLawContent(body.lawInfo, body.dataLaw, body.lawNumber);
  const ok2 = await pushLawSearch(body.lawInfo, body.lawNumber, body.contentText);
  const ok3 = await pushLawSearchDescription(body.lawInfo, body.lawNumber);

  const success = ok1 && ok2 && ok3;

  // 🔹 Gửi kết quả ra client
  return NextResponse.json({
    success,
    data: body,
  });
}
