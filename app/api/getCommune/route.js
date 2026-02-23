var fs = require("fs");
import { NextResponse, Request } from "next/server";

export async function GET(res) {


  // var data1 = JSON.parse(
  //   fs.readFileSync("app/asset/newCommune.json", "utf8")
  // );

  // for(let a = 0 ; a < data1.length ; a++){
  //  let divideCommune =  data1[a]['DETAIL'].split(/,(?![^()]*\))/).map(s => s.replace(/\(.*\)/img, '').replace(/(xã|phường|thị trấn)/img, '').trim());
  //  console.log(divideCommune);

  //   let bareCommune = data1[a]['PHUONG FULL'].replace(/(xã|phường|thị trấn)/img, '').trim();
  //  data1[a]['DETAIL'] = divideCommune;
  //  data1[a]['PHUONG'] = bareCommune;
  // }






  var data1 = JSON.parse(fs.readFileSync("app/asset/newCommune1.json", "utf8"));

  var data2 = JSON.parse(fs.readFileSync("app/asset/oldCommune.json", "utf8"));

  let data3 = []
  let item = "none";
  let found = false;

  for (let a = 0; a < data1.length; a++) {
    for (let b = 0; b < data1[a]["DETAIL"].length; b++) {
      for (let c = 0; c < data2.length; c++) {
        if (
          data1[a]["DETAIL"][b] === data2[c]["PHUONG"] &&
          data1[a]["TINH THANH"] === data2[c]["TINH"] &&
          data1[a]["QUAN"] === data2[c]["HUYEN"]
        ) {
          item = {
            province:  data2[c]["TINH FULL"] ,
            district: data2[c]["HUYEN FULL"],
            commune: data2[c]["PHUONG FULL"],
          };
          found = true;
          break;
        } else if (
          data1[a]["DETAIL"][b] === data2[c]["PHUONG"] &&
          data1[a]["TINH THANH"] === data2[c]["TINH"]
        ) {
          item = {
            province: data2[c]["TINH FULL"],
            district: data2[c]["HUYEN FULL"],
            commune: data2[c]["PHUONG FULL"],
          };
          found = true;
          break;
        }
      }
      data1[a]["DETAIL"][b] = item;
      // if (found) break;
    }

    data3[a] = {"PROVINCE":data1[a]['TINH THANH MOI'], "COMMUNE":data1[a]['PHUONG FULL'], "DETAIL":data1[a]['DETAIL']}
  }

  return NextResponse.json(data3);
}
