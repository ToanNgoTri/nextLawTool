var fs = require("fs");
import { NextResponse,Request } from "next/server";
var fs = require("fs");
import path from 'path';

export async function GET() {
      // bước 1 tạo ra JSON pair
      
//     var data = JSON.parse(fs.readFileSync("app/asset/LawCollection2.json", "utf8"))
//       let data2 = data.map((item) => {
//             return {
//                   [item._id]: item.info.lawDescription,
//             };
//       });
//       return NextResponse.json({data: data2});

      //////////////////////////// bước 2

//           var data0 = JSON.parse(fs.readFileSync("app/asset/lawNamePairDescription.json", "utf8"))


// //     var data = JSON.parse(fs.readFileSync("app/asset/LawMachine.LawCollection.json", "utf8"))
//                   var data = JSON.parse(fs.readFileSync("app/asset/LawCollection2.json", "utf8"))
//       let data2 = data.map((item) => {

//                               // console.log('item.info.lawRelated',item.info.lawRelated);

//             let lawRelated = {}
//             for(let i=0;i< Object.keys(item.info.lawRelated).length;i++){
//                   // let lawRelated = item.info.lawRelated
//                   if( Object.keys(item.info.lawRelated)[i].includes(' ')){
//                         lawRelated[Object.values(item.info.lawRelated)[i]] = Object.keys(item.info.lawRelated)[i]
//                   } else if(data0[Object.keys(item.info.lawRelated)[i]]){
//                         lawRelated[Object.keys(item.info.lawRelated)[i]] = data0[Object.keys(item.info.lawRelated)[i]]
//                         console.log();
                        
//                   }
//                   else{
//                         lawRelated[Object.keys(item.info.lawRelated)[i]] = Object.values(item.info.lawRelated)[i]
//                   }

                  
//                   // if(i == 2) break;
//             }
//             // console.log('lawRelated',lawRelated);
//             item.info.lawRelated = lawRelated

//             return item
            
            
//       });


            // fs.writeFile(
            //   "app/asset/lawCollectionResult2.json",
            //   JSON.stringify(data2),
            //   function (err, data) {
            //     if (err) throw err;
            //     console.log("write file successfully");
            //   }
            // );

            //////////////////////////////////////////////////////////// bước 3


            const a = JSON.parse(fs.readFileSync("app/asset/lawCollectionResult1.json", "utf8"));
            const b = JSON.parse(fs.readFileSync("app/asset/lawCollectionResult2.json", "utf8"));

            const merged = [...a, ...b]; // hoặc {...a, ...b}

            fs.writeFileSync("app/asset/lawCollectionResult.json", JSON.stringify(merged, null, 2));
      
      return NextResponse.json({data2: 1});

}
