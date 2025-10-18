const puppeteer = require("puppeteer");
import { NextResponse, Request } from "next/server";
var fs = require("fs");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  async function checkNonExistLaw(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(50000);

    await page.goto(url, { waitUntil: "load" });

    let source = await page.content({ waitUntil: "domcontentloaded" });

    const r = await page.evaluate(async () => {
      let doc_title = document.querySelectorAll(".doc-title a");
      let content = {};
      console.log('doc_title',doc_title);
      
      doc_title.forEach((item) => {
        let lawTitelForCheck = "";
        // if (item.innerText.match(/(\d+\/?\d*\/QH\d{1,2}|VBHN\-VPQH)/)) {
        if (item.innerText.match(/((?<= )\d*\/\D+\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?= )/img)) {

          let LawNumber = item.innerText.match(
            /((?<= )\d*\/\D+\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?= )/
          )[0];
          let yearSign = item.innerText.match(/20(1|2)\d/)[0];

          lawTitelForCheck = LawNumber + "(" + yearSign + ")";
                    console.log('lawTitelForCheck',lawTitelForCheck);

        } else if (
          item.innerText.match(
            /(\d+\/\d*\/\D+\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?= )/
          )
        ) {
          lawTitelForCheck = item.innerText.match(
            /(\d+\/\d*\/\D+\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?= )/
          )[0];
          console.log('lawTitelForCheck2',lawTitelForCheck);
          
        } else {
         console.log('lawTitelForCheck3',lawTitelForCheck);

        }
        content[lawTitelForCheck] = item.href;
        // }
      });

      return {
        content,
      };
    });

    await browser.close();
    return r;
  }

  let ObjectLaw = await checkNonExistLaw(url);
  // console.log('ObjectLaw',ObjectLaw);
  

  let content = {};

  let lawPairObject = await JSON.parse(
    fs.readFileSync("app/asset/ObjectLawPair.json", "utf8")
  );
  

  for (let a = 0; a < Object.keys(ObjectLaw["content"]).length; a++) {
    if (
      !lawPairObject[Object.keys(ObjectLaw["content"])[a].toLowerCase()] &&
      (!Object.values(ObjectLaw["content"])[a].match(/nghi\-quyet/gim) ||
        Object.values(ObjectLaw["content"])[a].match(/hdtp/gim))
    ) {
      content[Object.keys(ObjectLaw["content"])[a]] =
        ObjectLaw["content"][Object.keys(ObjectLaw["content"])[a]];
    }
  }

  return NextResponse.json({ content, URL: url });
}
