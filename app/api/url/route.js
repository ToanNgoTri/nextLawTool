const puppeteer = require("puppeteer");
import { NextResponse,Request } from "next/server";

export async function GET(request) {

      const { searchParams } = new URL(request.url);
      const url = searchParams.get("url");
      // const url = "https://luatvietnam.vn/tin-van-ban-moi/da-co-nghi-dinh-232-2025-nd-cp-sua-doi-nghi-dinh-ve-quan-ly-hoat-dong-kinh-doanh-vang-186-103775-article.html#google_vignette"


      async function eachRun(url) {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(50000);
      
        await page.goto(url, { waitUntil: "load" });
      
        let source = await page.content({ waitUntil: "domcontentloaded" });
      
        const r = await page.evaluate(async () => {
          let bg_phantich = document.querySelectorAll(".bg_phantich"); // loại bỏ phần tử khong cần thiết
          for (let f = 0; f < bg_phantich.length; f++) {
            bg_phantich[f].remove();
          }
      
          let elementContent = document.querySelectorAll(
            ".noidungtracuu >.docitem-1:not(.docitem-9 ~ div), .docitem-2:not(.docitem-9 ~ div), .docitem-5:not(.docitem-9 ~ div), .docitem-11:not(.docitem-9 ~ div), .docitem-12:not(.docitem-9 ~ div)"
            // ".noidungtracuu .docitem-5"
          );
          console.log("elementContent", elementContent);
      
          let lawRelated = "";
          let roleSign = "";
      
          if (Object.keys(elementContent).length == 0) {
            elementContent = document.querySelectorAll(".noidungtracuu");
            lawRelated = "";
            roleSign = "";
          } else {
            lawRelated = document.querySelector("#chidanthaydoind >.docitem-14")
              ? document.querySelector("#chidanthaydoind >.docitem-14").innerText
              : "";
            lawRelated =
              lawRelated +
              "\n" +
              (document.querySelector("#chidanthaydoind >.docitem-15")
                ? document.querySelector("#chidanthaydoind >.docitem-15").innerText
                : "");
            lawRelated = lawRelated.replace(/\_*/g, "");
            lawRelated = lawRelated.replace(/\n+/g, "\n");
      
            roleSign = document.querySelector("#chidanthaydoind >.docitem-9")
              ? document.querySelector("#chidanthaydoind >.docitem-9").innerText
              : "";
            roleSign = roleSign.replace(/\u00A0/gim, " ");
            roleSign = roleSign.replace(/\n +/g, "\n");
            roleSign = roleSign.replace(/\n+/g, "\n");
          }
      
          console.log(elementContent[1]);
      
          var content = "";
          for (let a = 0; a < elementContent.length; a++) {
            // content = content + "\n" + elementContent[a] ?elementContent[a].innerText:"";
            content = content + "\n" + elementContent[a].innerText;
          }
          content = content.replace(/\n+/g, "\n");
          content = content.replace(/  /gm, " ");
      
          let tableInfomation = document.querySelector(".div-table")
            ? document.querySelector(".div-table").innerText
            : "";
      
          let lawNumber;
          let unitPublish;
          let lawKind;
          let nameSign;
          let lawDaySign;
          let lawDescription;
          lawDescription = document.querySelector(".the-document-summary")
            ? document.querySelector(".the-document-summary").innerText
            : "";
      
          lawDescription = lawDescription.replace(/^ */, "");
          if (tableInfomation.match(/VBHN/)) {
            lawNumber = document.querySelector(
              ".div-table tr:nth-child(1) td:nth-child(2)"
            )
              ? document.querySelector(".div-table tr:nth-child(1) td:nth-child(2)")
                  .innerText
              : "";
            lawNumber = lawNumber.replace(/(^ | $)/gim, "");
            lawNumber = lawNumber.match(/^\d\//gim) ? `0${lawNumber}` : lawNumber;
      
            unitPublish = document.querySelector(
              ".div-table tr:nth-child(2) td:nth-child(4)"
            )
              ? document.querySelector(".div-table tr:nth-child(2) td:nth-child(4)")
                  .innerText
              : "";
      
            lawKind = document.querySelector(
              ".div-table tr:nth-child(2) td:nth-child(2)"
            )
              ? document.querySelector(".div-table tr:nth-child(2) td:nth-child(2)")
                  .innerText
              : "";
      
            nameSign = document.querySelector(
              ".div-table tr:nth-child(3) td:nth-child(4)"
            )
              ? document.querySelector(".div-table tr:nth-child(3) td:nth-child(4)")
                  .innerText
              : "";
      
            lawDaySign = document.querySelector(
              ".div-table tr:nth-child(1) td:nth-child(4)"
            ).innerText;
          } else {
            lawNumber = document.querySelector(
              ".div-table tr:nth-child(2) td:nth-child(2)"
            )
              ? document.querySelector(".div-table tr:nth-child(2) td:nth-child(2)")
                  .innerText
              : "";
            lawNumber = lawNumber.replace(/(^ | $)/gim, "");
            lawNumber = lawNumber.match(/^\d\//gim) ? `0${lawNumber}` : lawNumber;
      
            unitPublish = document.querySelector(
              ".div-table tr:nth-child(1) td:nth-child(2)"
            )
              ? document.querySelector(".div-table tr:nth-child(1) td:nth-child(2)")
                  .innerText
              : "";
      
            lawKind = document.querySelector(
              ".div-table tr:nth-child(3) td:nth-child(2)"
            )
              ? document.querySelector(".div-table tr:nth-child(3) td:nth-child(2)")
                  .innerText
              : "";
      
            nameSign = document.querySelector(
              ".div-table tr:nth-child(3) td:nth-child(4)"
            )
              ? document.querySelector(".div-table tr:nth-child(3) td:nth-child(4)")
                  .innerText
              : "";
      
            lawDaySign = document.querySelector(
              ".div-table tr:nth-child(4) td:nth-child(2)"
            )
              ? document.querySelector(".div-table tr:nth-child(4) td:nth-child(2)")
                  .innerText
              : "";
          }
      
          return {
            content,
            lawNumber,
            unitPublish,
            lawKind,
            nameSign,
            lawDaySign,
            lawDescription,
            lawRelated,
            roleSign,
          };
      
        });
      
        await browser.close();
        return r;
      }

      let data = await eachRun(url)
    
    return NextResponse.json({ data });        
  
}