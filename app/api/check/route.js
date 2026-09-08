const puppeteer = require("puppeteer");
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

// Lấy cặp {số hiệu luật -> link} từ trang đang mở trong browser
async function scrapeLawLinks(page) {
  return page.evaluate(async () => {
    let doc_title = document.querySelectorAll(".doc-title a");
    let content = {};

    console.log("FOUND:", doc_title.length);

    doc_title.forEach((item) => {
      const text = item.innerText.replace(":", "");
      let lawTitelForCheck = "";

      const lawNumberMatch = text.match(
        /((?<= )\d*\/\D+\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/,
      );
      const altNumberMatch = text.match(
        /(\d+\/\d*\/\S+\-?[^ |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/,
      );
      const yearMatch = text.match(/20\d{2}/);

      if (
        text.match(
          /((?<= )\d*\/\D{1,8}\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+)(?=\b)/gim,
        ) &&
        lawNumberMatch
      ) {
        const yearSign = yearMatch ? yearMatch[0] : "";
        lawTitelForCheck = lawNumberMatch[0] + "(" + yearSign + ")";
      } else if (altNumberMatch) {
        lawTitelForCheck = altNumberMatch[0];
      } else {
        lawTitelForCheck = item.innerText;
      }
      content[lawTitelForCheck] = item.href;
    });

    return content;
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const urls = searchParams.getAll("url").filter(Boolean);

  if (urls.length === 0) {
    return NextResponse.json(
      { content: {}, URL: null, error: "Thiếu tham số url" },
      { status: 400 },
    );
  }

  async function checkNonExistLaw(urlList) {
    const browser = await puppeteer.launch({
      // Bắt buộc headless: false — luatvietnam.vn trả 403 cho Chrome headless
      headless: false,
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(50000);

      const content = {};
      for (const url of urlList) {
        const res = await page.goto(url, { waitUntil: "load" });
        if (res && !res.ok()) {
          console.warn("check: HTTP", res.status(), url);
          continue;
        }
        Object.assign(content, await scrapeLawLinks(page));
      }
      return content;
    } finally {
      await browser.close();
    }
  }

  try {
    const scraped = await checkNonExistLaw(urls);

    let content = {};
    const lawKeys = Object.keys(scraped);

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
        content[key] = scraped[key];
      }
    }

    return NextResponse.json({
      content,
      URL: urls,
      scanned: lawKeys.length,
    });
  } catch (err) {
    console.error("check route error:", err);
    return NextResponse.json(
      { content: {}, URL: urls, error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
