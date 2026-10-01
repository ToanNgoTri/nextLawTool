// app/lib/lawTables.js
//
// Giữ nguyên BẢNG trong nội dung văn bản (luatvietnam) để app lawMachine vẽ lại.
//
// Cách lưu (tương thích ngược với app cũ):
//  - Trong chuỗi nội dung điều luật, mỗi hàng của bảng vẫn là 1 dòng text đọc được
//    ("ô 1 | ô 2 | ..."), nên app cũ hiển thị như text bình thường.
//  - Đầu mỗi dòng có tiền tố VÔ HÌNH: U+2063 + U+2064×id + U+2063 (ký tự định dạng,
//    không hiển thị) để app mới biết dòng đó thuộc bảng nào.
//  - Cấu trúc bảng (ô gộp rowspan/colspan, in đậm, căn lề, độ rộng cột) lưu riêng
//    ở field `tables` của document LawCollection: [{ id, w, rows }].
//    rows: [[{ t, cs?, rs?, b?, a? }]] — chỉ các ô gốc, theo thứ tự cột như HTML.

export const TABLE_MARK = "\u2063";
export const TABLE_ID_MARK = "\u2064";
// không neo ^ vì content có thể là JSON.stringify (xuống dòng thành "\n")
const TABLE_PREFIX_RE = /\u2063(\u2064*)\u2063/g;

// Bỏ ký tự đánh dấu vô hình (dùng cho fullText tìm kiếm, embed RAG…): tiền tố
// bảng U+2063/U+2064 và đánh dấu phụ lục U+2062 (lib/lawAppendix.js).
export function stripTableMarks(text) {
  if (typeof text !== "string") return text;
  return text.replace(/[\u2062\u2063\u2064]/g, "");
}

// Chỉ giữ các bảng còn được tham chiếu trong nội dung cuối cùng
// (phần mở đầu / chữ ký bị cắt bỏ thì bảng ở đó cũng bỏ).
export function pruneTables(tables, content) {
  if (!Array.isArray(tables) || !tables.length) return [];
  const text = typeof content === "string" ? content : JSON.stringify(content);
  const used = new Set();
  for (const m of text.matchAll(TABLE_PREFIX_RE)) used.add(m[1].length);
  return tables.filter((t) => used.has(t.id));
}

// Chạy TRONG trang (page.evaluate) trước khi lấy innerText: thay mỗi bảng có viền
// trong nội dung bằng các dòng text có tiền tố, trả về cấu trúc các bảng.
// Hàm phải tự chứa (không dùng biến ngoài) vì puppeteer serialize nó.
export function extractContentTablesInPage() {
  const MARK = "\u2063";
  const ID_MARK = "\u2064";

  const clean = (s) =>
    (s || "")
      .replace(/\u00A0/g, " ")
      .replace(/[ \t\r\f\v]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n+/g, "\n")
      .trim();

  // số cạnh có viền thật của ô
  const borderSides = (el) => {
    const cs = getComputedStyle(el);
    return ["Top", "Right", "Bottom", "Left"].filter(
      (s) =>
        !["none", "hidden"].includes(cs["border" + s + "Style"]) &&
        parseFloat(cs["border" + s + "Width"]) > 0,
    ).length;
  };

  const isBold = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let any = false;
    let node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue.replace(/[\s\u00A0]/g, "")) continue;
      any = true;
      const w = getComputedStyle(node.parentElement).fontWeight;
      if (!(w === "bold" || parseInt(w, 10) >= 600)) return false;
    }
    return any;
  };

  const alignOf = (el) => {
    const p = el.querySelector("p") || el;
    const a = getComputedStyle(p).textAlign;
    if (a === "center") return "c";
    if (a === "right" || a === "end") return "r";
    return "";
  };

  const all = [];
  document
    .querySelectorAll(".the-document-body table, .noidungtracuu table")
    .forEach((t) => {
      if (!all.includes(t)) all.push(t);
    });

  const tables = [];

  for (const table of all) {
    if (!table.isConnected) continue;
    // bảng lồng: để bảng ngoài xử lý (text bảng trong nằm trong ô)
    if (table.parentElement && table.parentElement.closest("table")) continue;
    // đầu văn bản, chữ ký, VB liên quan, bảng thuộc tính: giữ như cũ
    if (table.closest(".docitem-8, .docitem-9, .docitem-14, .docitem-15, .div-table"))
      continue;

    const trs = Array.from(table.rows);
    if (!trs.length) continue;

    // dựng lưới theo đúng thuật toán đặt ô của HTML
    const grid = [];
    const cells = [];
    trs.forEach((tr, r) => {
      grid[r] = grid[r] || [];
      let c = 0;
      Array.from(tr.cells).forEach((td) => {
        while (grid[r][c]) c++;
        const cs = Math.max(1, td.colSpan || 1);
        const rs = Math.max(1, Math.min(td.rowSpan || 1, trs.length - r));
        const info = { td, r, c, cs, rs };
        cells.push(info);
        for (let i = 0; i < rs; i++) {
          grid[r + i] = grid[r + i] || [];
          for (let j = 0; j < cs; j++) grid[r + i][c + j] = info;
        }
        c += cs;
      });
    });
    if (!cells.length) continue;
    const nCols = Math.max(...grid.map((row) => row.length));

    cells.forEach((ci) => {
      ci.bordered = borderSides(ci.td) >= 2;
    });
    // bảng không viền = bảng dàn trang (quốc hiệu, nơi nhận…) → giữ như text cũ
    if (!cells.some((ci) => ci.bordered)) continue;

    // cột "ma": không ô có viền nào phủ lên (Word hay sinh cột thừa ở mép bảng)
    const keep = [];
    for (let c = 0; c < nCols; c++) {
      keep[c] = cells.some((ci) => ci.bordered && ci.c <= c && c < ci.c + ci.cs);
    }
    const newIndex = [];
    let k = 0;
    for (let c = 0; c < nCols; c++) newIndex[c] = keep[c] ? k++ : -1;
    if (!k) continue;

    // độ rộng cột theo layout thật của trình duyệt
    const widths = new Array(k).fill(0);
    cells.forEach((ci) => {
      if (ci.cs === 1 && keep[ci.c]) {
        const w = ci.td.getBoundingClientRect().width;
        const nc = newIndex[ci.c];
        if (w > widths[nc]) widths[nc] = w;
      }
    });
    const total = widths.reduce((a, b) => a + b, 0);
    const w = total
      ? widths.map((x) => Math.max(1, Math.round((x / total) * 100)))
      : new Array(k).fill(Math.round(100 / k));

    const rows = trs.map(() => []);
    const lines = trs.map(() => []);
    const trailing = [];

    cells.forEach((ci) => {
      let ncs = 0;
      for (let j = 0; j < ci.cs; j++) if (keep[ci.c + j]) ncs++;
      const t = clean(ci.td.innerText);
      if (!ncs) {
        if (t) trailing.push(t);
        return;
      }
      const cell = { t };
      if (ncs > 1) cell.cs = ncs;
      if (ci.rs > 1) cell.rs = ci.rs;
      if (t && isBold(ci.td)) cell.b = 1;
      const a = t ? alignOf(ci.td) : "";
      if (a) cell.a = a;
      rows[ci.r].push(cell);
      if (t) lines[ci.r].push(t.replace(/\n/g, " "));
    });

    const textLines = lines.map((l) => l.join(" | ")).filter(Boolean);
    if (!textLines.length) continue;

    const id = tables.length;
    const prefix = MARK + ID_MARK.repeat(id) + MARK;
    const box = document.createElement("div");
    textLines.forEach((line) => {
      const d = document.createElement("div");
      d.textContent = prefix + line;
      box.appendChild(d);
    });
    // chữ nằm trong cột ma (vd dấu đóng ngoặc .” của đoạn trích) → dòng thường
    trailing.forEach((line) => {
      const d = document.createElement("div");
      d.textContent = line;
      box.appendChild(d);
    });
    table.replaceWith(box);

    tables.push({ id, w, rows });
  }

  return tables;
}
