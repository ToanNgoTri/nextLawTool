"use client";
import { useState } from "react";
import styles from "../page.module.css";

const CHECK_BUTTONS = [
  { label: "Check", key: "manual" }, // nút check URL nhập tay
  { label: "Nghị Định", key: "nghidinh" },
  { label: "Thông Tư", key: "thongtu" },
  { label: "Văn bản hợp nhất", key: "vanbanhopnhat" },
  { label: "Nghị quyết", key: "nghiquyet" },
  { label: "Luật", key: "luat" },
  { label: "VKSND", key: "vksnd" },
  { label: "TANDTC", key: "tandtc" },
  { label: "Pháp lệnh", key: "phaplenh" },
  { label: "BCA", key: "bca" },
  // thêm nút mới ở đây, tối đa tới 11 hoặc hơn vẫn tự co giãn
];

// Trang tìm kiếm HTML nhận NHIỀU loại văn bản trong 1 request (DocTypeIds=21,22)
// và không trả về dự thảo => mỗi nút chỉ cần 1 URL.
// Endpoint van-ban/ajax/searchajax (cách cũ) chỉ nhận 1 DocTypeId/request nên phải
// tách thành nhiều URL, và trộn lẫn dự thảo (~40% số dòng ở DocTypeId=21).
// Lưu ý: /tim-van-ban.html thì bị Cloudflare giữ ở trang "Just a moment...",
// chỉ /van-ban/tim-kiem.html với bộ tham số dưới đây là cào được.
const SEARCH_PAGE = "https://luatvietnam.vn/van-ban/tim-kiem.html";

const asList = (v) =>
  (Array.isArray(v) ? v : [v])
    .flatMap((x) => String(x ?? "").split(/[,;|]/))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",");

function searchURL({
  docTypeIds = "",
  organIds = "",
  fieldIds = "",
  from = "",
  to = "",
  keywords = "",
  pageIndex = 1,
} = {}) {
  const params = new URLSearchParams({
    SearchKeyword: keywords,
    SearchOptions: "1",
    SearchByDate: "issue",
    DateFromString: from,
    DateToString: to,
    DocTypeIds: asList(docTypeIds),
    OrganIds: asList(organIds),
    FieldIds: asList(fieldIds),
    LanguageId: "0",
    SignerIds: "",
    RowAmount: "100",
    PageSize: "100",
    PageIndex: String(pageIndex),
  });
  return `${SEARCH_PAGE}?${params.toString()}`;
}

// Trang tim-kiem.html trả 0 kết quả khi keyword đi kèm DocTypeIds/OrganIds
// (thử SearchKeyword/Keywords, có dấu/không dấu, SearchOptions 0|1|2 đều 0 dòng),
// trong khi endpoint ajax vẫn chạy => trường hợp đó dùng ajax, mỗi DocTypeId 1 URL.
const SEARCH_AJAX = "https://luatvietnam.vn/van-ban/ajax/searchajax";

const keywordNeedsAjax = ({ keywords = "", docTypeIds = "", organIds = "" }) =>
  Boolean(String(keywords).trim()) &&
  Boolean(asList(docTypeIds) || asList(organIds));

function ajaxSearchURLs({
  docTypeIds = "",
  organIds = "",
  from = "",
  to = "",
  keywords = "",
  pageIndex = 1,
} = {}) {
  const types = asList(docTypeIds).split(",").filter(Boolean);
  const organs = asList(organIds).split(",").filter(Boolean);
  const out = [];
  for (const DocTypeId of types.length ? types : ["0"]) {
    for (const OrganId of organs.length ? organs : ["0"]) {
      const params = new URLSearchParams({
        Keywords: keywords,
        DateFromString: from,
        DateToString: to,
        IsSearchExact: "0",
        SearchByDate: "issueDate",
        DocGroupId: "0",
        DocTypeId,
        EffectStatusId: "",
        LanguageId: "1",
        FieldId: "0",
        OrganId,
        SearchOptions: "1",
        PageSize: "100",
        PageIndex: String(pageIndex),
      });
      out.push(`${SEARCH_AJAX}?${params.toString()}`);
    }
  }
  return out;
}

// Tên tham số của endpoint ajax / các phiên bản trang tìm kiếm cũ -> tham số hiện tại
const SEARCH_PARAM_ALIASES = {
  searchkeyword: "SearchKeyword",
  keywords: "SearchKeyword",
  keyword: "SearchKeyword",
  doctypeids: "DocTypeIds",
  doctypeid: "DocTypeIds",
  organids: "OrganIds",
  organid: "OrganIds",
  fieldids: "FieldIds",
  fieldid: "FieldIds",
  signerids: "SignerIds",
  languageid: "LanguageId",
  languageids: "LanguageId",
  datefromstring: "DateFromString",
  datefrom: "DateFromString",
  datetostring: "DateToString",
  dateto: "DateToString",
  searchbydate: "SearchByDate",
  searchoptions: "SearchOptions",
  rowamount: "RowAmount",
  pagesize: "PageSize",
  pageindex: "PageIndex",
};

// Link dán tay: quy đổi mọi dạng link tìm kiếm luatvietnam (kể cả link ajax cũ hoặc
// /tim-van-ban.html đang bị Cloudflare chặn) về /van-ban/tim-kiem.html rồi mới cào.
// Link trang chi tiết văn bản hoặc host khác thì giữ nguyên.
export function normalizeSearchURL(raw) {
  let u;
  try {
    u = new URL(String(raw).trim());
  } catch {
    return [raw];
  }
  if (!/(^|\.)luatvietnam\.vn$/i.test(u.hostname)) return [raw];
  if (/tim-kiem\.html$/i.test(u.pathname)) return [raw];

  const picked = {};
  for (const [k, v] of u.searchParams) {
    const name = SEARCH_PARAM_ALIASES[k.toLowerCase()];
    if (name && v !== "") picked[name] = v;
  }
  if (Object.keys(picked).length === 0) return [raw];

  const opts = {
    docTypeIds: picked.DocTypeIds ?? "",
    organIds: picked.OrganIds ?? "",
    fieldIds: picked.FieldIds ?? "",
    from: picked.DateFromString ?? "",
    to: picked.DateToString ?? "",
    keywords: picked.SearchKeyword ?? "",
    pageIndex: picked.PageIndex ?? 1,
  };
  return keywordNeedsAjax(opts)
    ? ajaxSearchURLs(opts)
    : [searchURL(opts)];
}

const URL_MAP = {
  nghidinh: searchURL({ docTypeIds: 11, from: "01/01/2025" }),
  thongtu: searchURL({ docTypeIds: [21, 22], from: "01/01/2025" }),
  vanbanhopnhat: searchURL({
    docTypeIds: 59,
    organIds: 325,
    from: "01/01/2025",
  }),
  nghiquyet: searchURL({ docTypeIds: 13, organIds: 141, from: "01/01/2025" }),
  luat: searchURL({ docTypeIds: [58, 10], from: "01/01/2025" }),
  vksnd: searchURL({ docTypeIds: 3, organIds: 225, from: "01/01/2024" }),
  // Có keyword + filter => phải đi đường ajax (xem ghi chú keywordNeedsAjax)
  tandtc: ajaxSearchURLs({
    docTypeIds: 3,
    organIds: 193,
    from: "01/01/2025",
    keywords: "hướng dẫn",
  }),
  phaplenh: searchURL({ docTypeIds: 14 }),
  bca: searchURL({
    docTypeIds: [17, 4, 3, 20, 16, 5, 1, 28, 34, 35, 52, 92],
    organIds: 41,
  }),
};

const btnStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #555",
  background: "#2a2a2a",
  color: "#eee",
  fontSize: 13,
  cursor: "pointer",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const thStyle = {
  border: "1px solid #444",
  padding: "8px 10px",
  background: "#2a2a2a",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #333",
  padding: "8px 10px",
};

function Page() {
  const [URL, setURL] = useState("");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  async function runCheck(target) {
    const urls = [
      ...new Set(
        (Array.isArray(target) ? target : [target])
          .flatMap((u) => String(u || "").split(/\s+/))
          .filter(Boolean)
          .flatMap(normalizeSearchURL),
      ),
    ];
    if (urls.length === 0) return;
    // Luôn đổ URL vừa check vào textarea (mỗi URL 1 dòng) để link không bị mất
    setURL(urls.join("\n"));

    setLoading(true);
    try {
      const qs = urls
        .map((u) => `url=${encodeURIComponent(u)}`)
        .join("&");
      const r = await fetch(`/api/check?${qs}`);
      const text = await r.text();
      let res = {};
      try {
        res = text ? JSON.parse(text) : {};
      } catch {
        res = { error: `Phản hồi không hợp lệ (HTTP ${r.status})` };
      }
      if (res.error) {
        alert("Lỗi khi kiểm tra: " + res.error);
      }
      const content = res.content || {};
      setData(content);
      setStats({
        scanned: Number(res.scanned || 0),
        fresh: Object.keys(content).length,
        urls: urls.length,
      });
    } finally {
      setLoading(false);
    }
  }

  // Số cột = số nút / 2, làm tròn lên => luôn đúng 2 hàng, không scroll
  const columns = Math.ceil(CHECK_BUTTONS.length / 2);

  return (
    <div id={styles.container}>
      <div id={styles.inner_container}>
        <div
          id={styles.input_container}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 1000,
            margin: "0 auto",
            padding: "24px 16px",
          }}
        >
          <textarea
            className={styles.input_area}
            id={styles.content_input}
            value={URL}
            onChange={(e) => setURL(e.target.value)}
            placeholder="Dán URL cần kiểm tra..."
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 8,
              border: "1px solid #444",
              background: "#1e1e1e",
              color: "#eee",
              padding: 10,
              fontSize: 14,
              resize: "vertical",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                runCheck(URL);
              }
            }}
          />

          {/* Grid tự co: luôn 2 hàng, số cột = số nút/2, không scroll */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: "repeat(2, auto)",
              gridAutoFlow: "row",
              gap: 8,
              width: "100%",
            }}
          >
            {CHECK_BUTTONS.map((b) => (
              <button
                key={b.key}
                style={btnStyle}
                title={b.label}
                onClick={() =>
                  runCheck(b.key === "manual" ? URL : URL_MAP[b.key])
                }
              >
                {b.label}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ color: "#aaa", fontSize: 13 }}>Đang kiểm tra...</div>
          )}

          {!loading && stats && (
            <div
              style={{
                fontSize: 13,
                color: stats.scanned === 0 ? "#e57373" : "#aaa",
              }}
            >
              {stats.scanned === 0
                ? `Không đọc được văn bản nào từ ${stats.urls} link (link không phải trang kết quả tìm kiếm, hoặc bị Cloudflare chặn).`
                : `Đã quét ${stats.scanned} văn bản từ ${stats.urls} link · ${stats.fresh} chưa có trong DB`}
            </div>
          )}

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 8,
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Tên</th>
                <th style={thStyle}>URL</th>
                <th style={thStyle}>Chuyển</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                Object.keys(data).map((key, i) => (
                  <tr
                    key={i}
                    style={{ background: i % 2 === 0 ? "#1a1a1a" : "#141414" }}
                  >
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {i + 1}
                    </td>
                    <td style={tdStyle}>{key}</td>
                    <td style={{ ...tdStyle, wordBreak: "break-all" }}>
                      {data[key]}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <a
                        href={`/once?URL=${data[key]}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: 6,
                          background: "#4CAF50",
                          color: "#fff",
                          textDecoration: "none",
                          fontSize: 13,
                        }}
                      >
                        Redirect
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Page;