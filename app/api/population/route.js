var fs = require("fs");
import { NextResponse,Request } from "next/server";
var fs = require("fs");

export async function GET() {
    // const body = await req.json();
    // console.log('body', body);
    
    var data = JSON.parse(
        fs.readFileSync("app/asset/population.json", "utf8")
      );
    
// console.log(data);

      
    
      return NextResponse.json({data });

}
