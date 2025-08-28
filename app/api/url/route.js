export const runtime = "nodejs";
const puppeteer = require("puppeteer");
var cors = require("cors");
const bodyParer = require("body-parser");

import { NextResponse,Request } from "next/server";

export async function GET(request) {

      const { searchParams } = new URL(request.url);
      // const url = searchParams.get("url");
      const url = "https://luatvietnam.vn/tin-van-ban-moi/da-co-nghi-dinh-232-2025-nd-cp-sua-doi-nghi-dinh-ve-quan-ly-hoat-dong-kinh-doanh-vang-186-103775-article.html#google_vignette"


async function eachRun(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(50000);
  
    await page.goto(url, { waitUntil: "load" });
  
    let source = await page.content({ waitUntil: "domcontentloaded" });
  
    const r = await page.evaluate(async () => {
  
  
      var content = "";
      content = document.querySelector("#chidanthaydoind >.docitem-14").innerText
      // for (let a = 0; a < elementContent.length; a++) {
      //   // content = content + "\n" + elementContent[a] ?elementContent[a].innerText:"";
      //   content = content + "\n" + elementContent[a].innerText;
      // }
  
  
      return {
        content,

      };
  
    });
  
    await browser.close();
    return r;
  }
  
  let data = await eachRun(url)
    
    return NextResponse.json({ data });        
  
}