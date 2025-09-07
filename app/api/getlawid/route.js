var fs = require("fs");
import { NextResponse, Request } from "next/server";
var fs = require("fs");

export async function GET() {
  // const body = await req.json();
  // console.log('body', body);

  var data = JSON.parse(
    fs.readFileSync("app/asset/LawMachine.LawSearchDescription.json", "utf8")
  );

  let allLawSearchId = [];
//   await fetch("../asset/LawMachine.LawSearchDescription.json");
  //     .then((response) => response.json()) // Chuyển đổi response thành JSON
  //     .then((data) => {
  for (let a = 0; a < data.length; a++) {
    allLawSearchId[a] = data[a]["_id"];
  }
  //     })
  //     .catch((error) => console.log("Error:", error));

  console.log(allLawSearchId);

  // console.log(data);

  return NextResponse.json(allLawSearchId );
}
