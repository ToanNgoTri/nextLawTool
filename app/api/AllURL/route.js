const puppeteer = require("puppeteer");
import { NextResponse, Request } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("URL");
  const id = searchParams.get("id");


async function eachRun(url) {
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
    let bg_phantich = document.querySelectorAll(".bg_phantich"); // loại bỏ phần tử khong cần thiết
    for (let f = 0; f < bg_phantich.length; f++) {
      bg_phantich[f].remove();
    }

    let elementContent = document.querySelectorAll(
      ".noidungtracuu >.docitem-1:not(.docitem-9 ~ div), .docitem-2:not(.docitem-9 ~ div), .docitem-5:not(.docitem-9 ~ div), .docitem-11:not(.docitem-9 ~ div), .docitem-12:not(.docitem-9 ~ div)"
      // ".noidungtracuu .docitem-5"
    );

    

    let lawRelated = "";
    let roleSign = "";

    if (Object.keys(elementContent).length == 0) {
      // Văn bản hợp nhất (và một số trang không có .noidungtracuu/.docitem-*):
      // nội dung nằm trong .the-document-body[data-role="content-body"]
      elementContent = document.querySelectorAll(
        '.the-document-body[data-role="content-body"]',
      );
      if (Object.keys(elementContent).length == 0) {
        elementContent = document.querySelectorAll(".noidungtracuu");
      }
      lawRelated = "";
      roleSign = "";
    } else {
      lawRelated = document.querySelector(".the-document-body >.docitem-14")
        ? document.querySelector(".the-document-body >.docitem-14").innerText
        : "";
      lawRelated =
        lawRelated +
        "\n" +
        (document.querySelector(".the-document-body >.docitem-15")
          ? document.querySelector(".the-document-body >.docitem-15").innerText
          : "");
      lawRelated = lawRelated.replace(/\_*/g, "");
      lawRelated = lawRelated.replace(/\n+/g, "\n");

      roleSign = document.querySelector(".the-document-body >.docitem-9")
        ? document.querySelector(".the-document-body >.docitem-9").innerText
        : "";
      roleSign = roleSign.replace(/\u00A0/gim, " ");
      roleSign = roleSign.replace(/\n +/g, "\n");
      roleSign = roleSign.replace(/\n+/g, "\n");
    }


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

    let lawNumber = "";
    let unitPublish = "";
    let lawKind = "";
    let nameSign = "";
    let lawDaySign = "";
    let lawDescription = "";

    // ─── Đọc bảng thuộc tính theo NHÃN thay vì theo vị trí hàng/cột ───
    // Bảng .div-table có thể 2 hoặc 4 cột: (nhãn, giá trị[, nhãn, giá trị]).
    // Map theo nhãn để đúng cho MỌI loại VB (Luật, Pháp lệnh, VBHN, Thông tư…)
    // dù thứ tự hàng thay đổi — trước đây dùng tr:nth-child nên hay lấy lệch.
    const tableMap = {};
    document.querySelectorAll(".div-table tr").forEach((tr) => {
      const tds = Array.from(tr.querySelectorAll("td"));
      for (let i = 0; i + 1 < tds.length; i += 2) {
        const key = tds[i].innerText
          .trim()
          .toLowerCase()
          .replace(/[:\s]+$/g, "");
        const val = tds[i + 1].innerText.trim();
        if (key && !(key in tableMap)) tableMap[key] = val;
      }
    });
    const pickField = (...keys) => {
      for (const k of keys) {
        const found = Object.keys(tableMap).find((label) => label.includes(k));
        if (found && tableMap[found]) return tableMap[found];
      }
      return "";
    };
    const cell = (r, c) => {
      const el = document.querySelector(
        `.div-table tr:nth-child(${r}) td:nth-child(${c})`,
      );
      return el ? el.innerText.trim() : "";
    };

    lawNumber = pickField("số hiệu");
    unitPublish = pickField("cơ quan ban hành", "nơi ban hành");
    lawKind = pickField("loại văn bản");
    nameSign = pickField("người ký");
    lawDaySign = pickField("ngày ban hành", "ngày ký");
    lawDescription = pickField("trích yếu", "tên văn bản");

    // Fallback theo vị trí cũ nếu không map được theo nhãn.
    if (tableInfomation.match(/VBHN/)) {
      if (!lawNumber) lawNumber = cell(1, 2);
      if (!unitPublish) unitPublish = cell(2, 4);
      if (!lawKind) lawKind = cell(2, 2);
      if (!nameSign) nameSign = cell(3, 4);
      if (!lawDaySign) lawDaySign = cell(1, 4);
      if (!lawDescription) lawDescription = cell(4, 2);
    } else {
      if (!lawNumber) lawNumber = cell(2, 2);
      if (!unitPublish) unitPublish = cell(1, 2);
      if (!lawKind) lawKind = cell(3, 2);
      if (!nameSign) nameSign = cell(3, 4);
      if (!lawDaySign) lawDaySign = cell(5, 2);
      if (!lawDescription) lawDescription = cell(4, 2);
    }

    // Chuẩn hóa số hiệu: "9/…" → "09/…".
    lawNumber = lawNumber.replace(/(^ | $)/gim, "");
    lawNumber = lawNumber.match(/^\d\//gim) ? `0${lawNumber}` : lawNumber;

    // Chuẩn hóa trích yếu.
    lawDescription = lawDescription
      .replace(/^ */, "")
      .replace(/Sửa đổi/, "sửa đổi");

    // Lưới an toàn: lawDaySign phải là ngày dd/mm/yyyy; nếu không, lấy lại
    // đúng ngày ngay sau nhãn "Ngày ban hành" trong text bảng.
    if (!/\d{1,2}\/\d{1,2}\/\d{4}/.test(lawDaySign)) {
      const md = tableInfomation.match(
        /ngày ban hành[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
      );
      lawDaySign = md ? md[1] : "";
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


  async function allRun(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(70000);
    await page.goto(url);

    // OR the faster method that doesn't wait for images to load:
    let source = await page.content({ waitUntil: "domcontentloaded" });
    console.log('url',url);

    const r = await page.evaluate(async () => {
      let a = [];
      let elements = document.querySelectorAll(".doc-title");
      
      elements.forEach((link) => {
        a.push(link.querySelector("a").href); // In ra giá trị href của mỗi thẻ <a>
      });

      return a;
    });

    // console.log(r);

    await browser.close();
    // console.log(source.toString());
    return r;
  }

  let arrayLink = await allRun(url);

  let data = "";
  data = await eachRun(arrayLink[id]);
  
    return NextResponse.json({ data });        

}

