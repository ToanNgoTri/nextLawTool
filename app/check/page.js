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

const URL_MAP = {
  nghidinh:
    "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=ngh%E1%BB%8B&search=&search=&DocTypeIds=11&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&PageSize=100&PageIndex=1",
  thongtu:
    "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=&search=&search=&DocTypeIds=21&DocTypeIds=22&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&PageSize=100&PageIndex=1",
  vanbanhopnhat:
    "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=v%C4%83&search=v%C4%83n%20ph%C3%B2ng%20q&search=&DocTypeIds=59&OrganIds=325&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&PageSize=100&PageIndex=1",
  nghiquyet:
    "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01%2F01%2F2025&DateToString=&search=&DocTypeIds=13&search=h%E1%BB%99i+%C4%91%E1%BB%93ng+th%E1%BA%A9m+p&OrganIds=141&search=&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&PageSize=100&PageIndex=1",
  luat:
    "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=lu%E1%BA%ADt&search=&search=&DocTypeIds=58&DocTypeIds=10&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&PageSize=100&PageIndex=1",
  vksnd:
    "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01%2F01%2F2024&DateToString=&search=c%C3%B4ng&DocTypeIds=3&search=&OrganIds=225&search=&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&PageSize=100&PageIndex=1",
  tandtc:
    "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=h%C6%B0%E1%BB%9Bng%20d%E1%BA%ABn&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=&search=T%C3%92A%20%C3%81N%20NH%C3%82&search=&DocTypeIds=3&OrganIds=193&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&PageSize=100&PageIndex=1",
  phaplenh:
    "https://luatvietnam.vn/van-ban/tim-kiem.html?SearchKeyword=&SearchOptions=1&SearchByDate=issue&DateFromString=&DateToString=&search=&search=&search=&DocTypeIds=14&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=100&PageSize=100&PageIndex=1",
  bca:
    "https://luatvietnam.vn/van-ban/tim-kiem.html?SearchKeyword=&SearchOptions=1&SearchByDate=issue&DateFromString=&DateToString=&search=&search=&search=&DocTypeIds=17&DocTypeIds=4&DocTypeIds=3&DocTypeIds=20&DocTypeIds=16&DocTypeIds=5&DocTypeIds=1&DocTypeIds=28&DocTypeIds=34&DocTypeIds=35&DocTypeIds=52&DocTypeIds=92&OrganIds=41&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=100&PageSize=100&PageIndex=1",
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

  async function runCheck(targetUrl) {
    setURL(targetUrl);
    setLoading(true);
    try {
      const r = await fetch(`/api/check?url=` + encodeURIComponent(targetUrl));
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