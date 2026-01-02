var fs = require("fs");
import { NextResponse, Request } from "next/server";
var fs = require("fs");

export async function GET() {
  // const body = await req.json();
  // console.log('body', body);

  var data = JSON.parse(
    fs.readFileSync("app/asset/LawMachine.LawCollectionid.json", "utf8")
  );

  let allLawSearchId = [];

  for (let a = 0; a < data.length; a++) {
    allLawSearchId[a] = data[a]["_id"];
  }


  return NextResponse.json(allLawSearchId );
}
