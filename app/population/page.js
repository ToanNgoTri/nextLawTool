"use client";
import { useEffect } from "react";

function Page() {
  let data = [];
  let dataDone = [];
  useEffect(() => {
    fetch("/api/population").then((res) => {
      res.json().then((res) => {
        data = res.data;

        // for(let a = 0 ; a < data.length ; a++){

        // }

        for (let a = 0; a < data.length; a++) {
          let item = data[a];

          for (let b = 0; b < data.length; b++) {
            // const [day1, month1, year1] = data[b]["NAMSINH"].split("/");
            // const dateB = new Date(year1, month1 - 1, day1);

            // const [day2, month2, year2] = item["NAMSINH"].split("/");
            // const dateA = new Date(year2, month2 - 1, day2);

            if (item["HOTEN"] == item["TENCH"]) {
              item["QUANHE"] = "CH";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              (item["QUANHE"] == "VỢ" || item["QUANHE"] == "CHỒNG") &&
              (item["TENCHA"] == item["TENCH"] ||
                item["TENME"] == item["TENCH"] ||
                item["TENME"] == data[b]["HOTEN"] ||
                item["TENCHA"] == data[b]["HOTEN"])
            ) {
              item["QUANHE"] = "CON";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              data[b]["QUANHE"] == "CON" &&
              (item["TENCHA"] == data[b]["HOTEN"] ||
                item["TENME"] == data[b]["HOTEN"])
            ) {
              item["QUANHE"] = "CHÁU";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              data[b]["QUANHE"] == "CON" &&
              item["HOTEN"] == data[b]["TENME"]
            ) {
              item["QUANHE"] = "VỢ";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              data[b]["QUANHE"] == "CON" &&
              item["HOTEN"] == data[b]["TENME"]
            ) {
              item["QUANHE"] = "CHỒNG";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              (data[b]["QUANHE"] == "EM" ||
                data[b]["QUANHE"] == "CHỊ" ||
                data[b]["QUANHE"] == "ANH") &&
              (item["TENCHA"] == data[b]["HOTEN"] ||
                item["TENME"] == data[b]["HOTEN"])
            ) {
              item["QUANHE"] = "CHÁU";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              data[b]["QUANHE"] == "CH" &&
              item["HOTEN"] == data[b]["TENCHA"]
            ) {
              item["QUANHE"] = "CHA";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              data[b]["QUANHE"] == "CH" &&
              item["HOTEN"] == data[b]["TENME"]
            ) {
              item["QUANHE"] = "MẸ";
              break;
            }else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              data[b]["QUANHE"] == "CH" &&
              item["GIOITINH"] == "TRUE" &&
              (item["TENCHA"] == data[b]["TENCHA"] ||
                item["TENME"] == data[b]["TENME"]) &&
              new Date(
                item["NAMSINH"].split("/")[2],
                item["NAMSINH"].split("/")[1] - 1,
                item["NAMSINH"].split("/")[0]
              ) >
                new Date(
                  data[b]["NAMSINH"].split("/")[2],
                  data[b]["NAMSINH"].split("/")[1] - 1,
                  data[b]["NAMSINH"].split("/")[0]
                )
            ) {
              item["QUANHE"] = "ANH";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              data[b]["QUANHE"] == "CH" &&
              item["GIOITINH"] == "FALSE" &&
              (item["TENCHA"] == data[b]["TENCHA"] ||
                item["TENME"] == data[b]["TENME"]) &&
              new Date(
                item["NAMSINH"].split("/")[2],
                item["NAMSINH"].split("/")[1] - 1,
                item["NAMSINH"].split("/")[0]
              ) >
                new Date(
                  data[b]["NAMSINH"].split("/")[2],
                  data[b]["NAMSINH"].split("/")[1] - 1,
                  data[b]["NAMSINH"].split("/")[0]
                )            ) {
              item["QUANHE"] = "CHỊ";
              break;
            } else if (
              item["SOHOK"] == data[b]["SOHOK"] &&
              data[b]["QUANHE"] == "CH" &&
              (item["TENCHA"] == data[b]["TENCHA"] ||
                item["TENME"] == data[b]["TENME"]) &&
              new Date(
                item["NAMSINH"].split("/")[2],
                item["NAMSINH"].split("/")[1] - 1,
                item["NAMSINH"].split("/")[0]
              ) <
                new Date(
                  data[b]["NAMSINH"].split("/")[2],
                  data[b]["NAMSINH"].split("/")[1] - 1,
                  data[b]["NAMSINH"].split("/")[0]
                )            ) {
              item["QUANHE"] = "EM";
              break;
            } 
          }

          data[a] = item;
        }

        console.log(data);
      });
    });
  }, []);

  return <div>page</div>;
}

export default Page;
