var fs = require("fs");
import { NextResponse,Request } from "next/server";
var fs = require("fs");
import path from 'path';

export async function GET() {
    var data1 = JSON.parse(fs.readFileSync("app/asset/b.json", "utf8"))
      // let data2 = data.map((item) => {
      //       return {
      //             [item._id]: item.info.lawDayActive,
      //       };
      // });

      var data2 = JSON.parse(fs.readFileSync("app/asset/LawCollection2.json", "utf8"))

      data2.map(item=>{
            item.info.lawDayActive = data1[item['_id']]


      })

      return NextResponse.json({data: data2});

}
