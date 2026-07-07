const puppeteer = require("puppeteer");
import { NextResponse, Request } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  async function checkNonExistLaw(url) {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(50000);

    await page.goto(url, { waitUntil: "load" });

    let source = await page.content({ waitUntil: "domcontentloaded" });

    const r = await page.evaluate(async () => {
      let doc_title = document.querySelectorAll(".doc-title a");
      let content = {};

      console.log("FOUND:", doc_title.length);

      doc_title.forEach((item) => {
        console.log("item", item);

        let lawTitelForCheck = "";
        // if (item.innerText.match(/(\d+\/?\d*\/QH\d{1,2}|VBHN\-VPQH)/)) {
        if (
          item.innerText
            .replace(":", "")
            .match(
              /((?<= )\d*\/\D{1,8}\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/gim,
            )
        ) {
          let LawNumber = item.innerText
            .replace(":", "")
            .match(
              /((?<= )\d*\/\D+\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/,
            )[0];
          let yearSign = item.innerText.replace(":", "").match(/20\d{2}/)[0];

          lawTitelForCheck = LawNumber + "(" + yearSign + ")";
          console.log("lawTitelForCheck", lawTitelForCheck);
        } else if (
          item.innerText
            .replace(":", "")
            .match(/(\d+\/\d*\/\S+\-?[^ |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/)
        ) {
          lawTitelForCheck = item.innerText
            .replace(":", "")
            .match(/(\d+\/\d*\/\S+\-?[^ |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/)[0];
          console.log("lawTitelForCheck2", lawTitelForCheck);
        } else {
          lawTitelForCheck = item.innerText;
          console.log("lawTitelForCheck3", lawTitelForCheck);
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

  const lawKeys = Object.keys(ObjectLaw["content"]);

  // Đối chiếu trực tiếp với MongoDB: lấy các _id đã tồn tại trong đám luật vừa cào
  const database = client.db("LawMachine");
  const collection = database.collection("LawSearchDescription");
  const existingDocs = await collection
    .find({ _id: { $in: lawKeys } }, { projection: { _id: 1 } })
    .toArray();
  const existingIds = new Set(existingDocs.map((d) => d._id));

  // Chỉ giữ lại những luật CHƯA có trong DB
  for (const key of lawKeys) {
    if (!existingIds.has(key)) {
      content[key] = ObjectLaw["content"][key];
    }
  }

  return NextResponse.json({ content, URL: url });
}
