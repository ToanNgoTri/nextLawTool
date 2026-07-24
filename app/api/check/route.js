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
    try {
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

        const text = item.innerText.replace(":", "");
        let lawTitelForCheck = "";

        const lawNumberMatch = text.match(
          /((?<= )\d*\/\D+\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/,
        );
        const altNumberMatch = text.match(
          /(\d+\/\d*\/\S+\-?[^ |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/,
        );
        const yearMatch = text.match(/20\d{2}/);

        // if (item.innerText.match(/(\d+\/?\d*\/QH\d{1,2}|VBHN\-VPQH)/)) {
        if (
          text.match(
            /((?<= )\d*\/\D{1,8}\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/gim,
          ) &&
          lawNumberMatch
        ) {
          const yearSign = yearMatch ? yearMatch[0] : "";
          lawTitelForCheck = lawNumberMatch[0] + "(" + yearSign + ")";
          console.log("lawTitelForCheck", lawTitelForCheck);
        } else if (altNumberMatch) {
          lawTitelForCheck = altNumberMatch[0];
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

    return r;
    } finally {
      await browser.close();
    }
  }

  try {
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
  } catch (err) {
    console.error("check route error:", err);
    return NextResponse.json(
      { content: {}, URL: url, error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
