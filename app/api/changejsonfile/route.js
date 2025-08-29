var fs = require("fs");
import { NextResponse,Request } from "next/server";


export async function POST(req) {
    const body = await req.json();
    // console.log('body', body);
    
    var data3 = JSON.parse(
        fs.readFileSync("app/asset/ObjectLawPair.json", "utf8")
      );
    
      if (body.lawInfo["lawNameDisplay"].match(/Luật/gim)) {
        data3[
          body.lawInfo["lawNameDisplay"]
            .toLowerCase()
            .replace(/( và| của|,|&)/gim, "")
        ] = body.lawNumber;
        data3[body.lawNumber.toLowerCase()] = body.lawNumber;
    
        console.log(1);
      } else {
        data3[body.lawNumber.toLowerCase()] = body.lawNumber;
        console.log(2);
      }
    
      fs.writeFile(
        "app/asset/ObjectLawPair.json",
        JSON.stringify(data3),
        function (err, data) {
          if (err) throw err;
          console.log("write file successfully");
        }
      );
    
      return NextResponse.json({ success: true, data: body });

}