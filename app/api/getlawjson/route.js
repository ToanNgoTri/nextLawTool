// app/api/getlawjson/route.js
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const client = new MongoClient(process.env.MONGODB_URI);

// Luôn đọc mới từ MongoDB, không để Next.js cache response (nếu không luật mới thêm sẽ không hiện)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const database = client.db("LawMachine");
    const collection = database.collection("LawSearchDescription");

    // Chỉ lấy _id và info.lawDescription / info.lawNameDisplay để đối chiếu
    const docs = await collection
      .find({}, { projection: { "info.lawDescription": 1, "info.lawNameDisplay": 1 } })
      .toArray();

    // Dựng lại object đối chiếu (giống ObjectLawPair.json trước đây):
    //  - normalize(lawNameDisplay) -> _id  (với các luật có "Luật")
    //  - _id                       -> lawDescription
    const ObjectLawPair = {};
    for (const doc of docs) {
      const id = doc["_id"];
      const info = doc.info || {};
      const lawNameDisplay = info.lawNameDisplay || "";
      const lawDescription = info.lawDescription || "";

      if (lawNameDisplay.match(/Luật/gim)) {
        ObjectLawPair[
          lawNameDisplay.toLowerCase().replace(/( và| của|,|&)/gim, "")
        ] = id;
      }
      ObjectLawPair[id] = lawDescription;
    }

    return NextResponse.json(ObjectLawPair);
  } catch (error) {
    console.error("❌ Error in getlawjson:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
