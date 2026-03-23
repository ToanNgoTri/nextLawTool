"use client";
import { useEffect } from "react";

function Page() {
  let data = [];
  let dataDone = [];
  useEffect(() => {
    fetch("/api/population").then((res) => {
      res.json().then((res) => {
        data = res.data;


const parseDate = (d) => {
  if (!d) return null;
  const [day, month, year] = d.split("/");
  return new Date(year, month - 1, day);
};

// 🔥 dùng OR
const sameParents = (a, b) => {
  return (
    (a["TENCHA"] && a["TENCHA"] === b["TENCHA"]) ||
    (a["TENME"] && a["TENME"] === b["TENME"])
  );
};

const isChildOf = (child, parent) => {
  return (
    child["TENCHA"] === parent["HOTEN"] ||
    child["TENME"] === parent["HOTEN"]
  );
};

function assignQuanHe(data) {
  const chuHo = data.find(x => x["QUANHE"] === "CH");
  if (!chuHo) return data;

  // ===== B1: CHA / MẸ =====
  data.forEach(item => {
    if (item === chuHo) return;

    if (item["HOTEN"] === chuHo["TENCHA"]) {
      item["QUANHE"] = "CHA";
    } else if (item["HOTEN"] === chuHo["TENME"]) {
      item["QUANHE"] = "MẸ";
    }
  });

  // ===== B2: CON (ưu tiên cao nhất) =====
  data.forEach(item => {
    if (item["QUANHE"]) return;

    if (
      isChildOf(item, chuHo) ||
      (item["TENCHA"] === chuHo["TENVO"] ||
        item["TENME"] === chuHo["TENVO"] ||
        item["TENCHA"] === chuHo["TENCHONG"] ||
        item["TENME"] === chuHo["TENCHONG"])
    ) {
      item["QUANHE"] = "CON";
    }
  });

  // ===== B3: VỢ / CHỒNG =====
  data.forEach(item => {
    if (item["QUANHE"]) return;

    if (
      data.some(
        x =>
          x["QUANHE"] === "CON" &&
          (item["HOTEN"] === x["TENCHA"] ||
            item["HOTEN"] === x["TENME"])
      )
    ) {
      item["QUANHE"] =
        item["GIOITINH"] === "TRUE" ? "CHỒNG" : "VỢ";
    }
  });

  // ===== B4: ANH / CHỊ / EM (dùng OR) =====
  const children = data.filter(x => x["QUANHE"] === "CON");

  children.forEach(a => {
    children.forEach(b => {
      if (a === b) return;
      if (!sameParents(a, b)) return;

      const dateA = parseDate(a["NAMSINH"]);
      const dateB = parseDate(b["NAMSINH"]);

      if (!dateA || !dateB) return;

      if (dateA < dateB) {
        a["QUANHE"] =
          a["GIOITINH"] === "TRUE" ? "ANH" : "CHỊ";
      } else if (dateA > dateB) {
        a["QUANHE"] = "EM";
      }
    });
  });

  // ===== B5: CHÁU =====
  data.forEach(item => {
    if (item["QUANHE"]) return;

    if (
      data.some(
        x =>
          x["QUANHE"] === "CON" &&
          (item["TENCHA"] === x["HOTEN"] ||
            item["TENME"] === x["HOTEN"])
      )
    ) {
      item["QUANHE"] = "CHÁU";
    }
  });

  return data;
}

        dataDone = assignQuanHe(data);
        console.log(dataDone);
        

      });
    });
  }, []);

  return <div>page</div>;
}

export default Page;
