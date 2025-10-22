const { MongoClient } = require("mongodb");
import { NextResponse, Request } from "next/server";

const client = new MongoClient(
  "mongodb://thuvienphapluat:ZvQn9683p8NnPXFMdR1VX53HTK3Da1WqyXJpvtgMMASTRdDkyu87lFAL7aR5DiiN@188.245.52.121:6980/?directConnection=true"
);

export async function POST(req) {
  const body = await req.json();

  // let success = true
  async function pushLawContent(info, content, id) {
    try {
      const database = client.db("LawMachine");
      const LawContent = database.collection("LawCollection");
      await LawContent.insertOne({ _id: id, info, content });
      return Response.json({ success: true, message: "Inserted successfully" });
    } catch (error) {
      console.error("❌ Error in pushLawContent:", error);


       console.error("Error inserting:", error);

     return  false
    // Nếu lỗi duplicate key (E11000)
    // if (error.code === 11000) {
    //   return Response.json(
    //     { success: false, message: "Duplicate document _id", error: error.message },
    //     { status: 409 } // 409 Conflict
    //   );
    // }

    // // Các lỗi khác
    // return Response.json(
    //   { success: false, message: "Insert failed", error: error.message },
    //   { status: 500 }
    // );
  


    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
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
    }  finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
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
    }  finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }

  // console.log('body.dataLaw',body.dataLaw);

  let success =  await pushLawContent(body.lawInfo, body.dataLaw, body.lawNumber);
  await pushLawSearch(body.lawInfo, body.lawNumber, body.contentText);
  await pushLawSearchDescription(body.lawInfo, body.lawNumber);

  return NextResponse.json({ success: success, data: body });
}
