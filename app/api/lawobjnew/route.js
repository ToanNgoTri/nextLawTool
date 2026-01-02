var fs = require("fs");
import { NextResponse,Request } from "next/server";
var fs = require("fs");

export async function GET() {


            const a = JSON.parse(fs.readFileSync("app/asset/ObjectLawPair1.json", "utf8"));
            const b = JSON.parse(fs.readFileSync("app/asset/lawNamePairDescription.json", "utf8"));

            for (let i = 0; i < Object.keys(a).length; i++) {
                  if(!b[Object.keys(a)[i]] && (Object.keys(a)[i].includes(' ') || Object.keys(a)[i].includes('QH')|| Object.keys(a)[i].includes('NQ')  )  ){
                          b[Object.keys(a)[i]] = a[Object.keys(a)[i]]
                  }
            }



            fs.writeFileSync("app/asset/ObjectLaw.json", JSON.stringify(b, null, 2));

      return NextResponse.json({data2: 1});

}
