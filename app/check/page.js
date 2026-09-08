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

// luatvietnam.vn không còn tìm kiếm server-side trên tim-van-ban.html / tim-kiem.html
// (mọi query string kiểu DocTypeIds=... đều trả "Không tìm thấy văn bản phù hợp").
// Kết quả giờ nằm ở endpoint ajax bên dưới, với tên tham số dạng SỐ ÍT:
// Keywords / DocTypeId / OrganId / FieldId, và mỗi request chỉ nhận 1 DocTypeId
// => loại văn bản nào cần nhiều DocTypeId thì trả về nhiều URL.
const SEARCH_AJAX = "https://luatvietnam.vn/van-ban/ajax/searchajax";

function searchURL({ docTypeId, organId = 0, from = "", keywords = "" }) {
  const params = new URLSearchParams({
    Keywords: keywords,
    DateFromString: from,
    DateToString: "",
    IsSearchExact: "0",
    SearchByDate: "issueDate",
    DocGroupId: "0",
    DocTypeId: String(docTypeId),
    EffectStatusId: "",
    LanguageId: "1",
    FieldId: "0",
    OrganId: String(organId),
    SearchOptions: "1",
    PageSize: "100",
    PageIndex: "1",
  });
  return `${SEARCH_AJAX}?${params.toString()}`;
}

const URL_MAP = {
  nghidinh: [searchURL({ docTypeId: 11, from: "01/01/2025" })],
  thongtu: [21, 22].map((docTypeId) =>
    searchURL({ docTypeId, from: "01/01/2025" }),
  ),
  vanbanhopnhat: [
    searchURL({ docTypeId: 59, organId: 325, from: "01/01/2025" }),
  ],
  nghiquyet: [searchURL({ docTypeId: 13, organId: 141, from: "01/01/2025" })],
  luat: [58, 10].map((docTypeId) =>
    searchURL({ docTypeId, from: "01/01/2025" }),
  ),
  vksnd: [searchURL({ docTypeId: 3, organId: 225, from: "01/01/2024" })],
  tandtc: [
    searchURL({
      docTypeId: 3,
      organId: 193,
      from: "01/01/2025",
      keywords: "hướng dẫn",
    }),
  ],
  phaplenh: [searchURL({ docTypeId: 14 })],
  bca: [17, 4, 3, 20, 16, 5, 1, 28, 34, 35, 52, 92].map((docTypeId) =>
    searchURL({ docTypeId, organId: 41 }),
  ),
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

  async function runCheck(target) {
    const urls = (Array.isArray(target) ? target : [target])
      .flatMap((u) => String(u || "").split(/\s+/))
      .filter(Boolean);
    if (urls.length === 0) return;
    if (urls.length === 1) setURL(urls[0]);

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
      setData(res.content || {});
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