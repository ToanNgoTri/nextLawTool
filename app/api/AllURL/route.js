const puppeteer = require("puppeteer");
import { NextResponse, Request } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("URL");
  const id = searchParams.get("id");


    console.log('url',url);
    console.log('id',id);
    

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


  async function allRun(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(70000);
    await page.goto(url);

    // OR the faster method that doesn't wait for images to load:
    let source = await page.content({ waitUntil: "domcontentloaded" });

    const r = await page.evaluate(async () => {
      let a = [];
      let elements = document.querySelectorAll(".doc-title");
      elements.forEach((link) => {
        a.push(link.querySelector("a").href); // In ra giá trị href của mỗi thẻ <a>
      });
      console.log("elements", elements);

      return a;
    });

    // console.log(r);

    await browser.close();
    // console.log(source.toString());
    return r;
  }

  let arrayLink = await allRun(url);
  console.log('arrayLink',arrayLink);
  
  let data = "";
  data = await eachRun(arrayLink[id]);

    return NextResponse.json({ data });        

}

