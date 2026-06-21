"use client";

import { useState, useEffect } from "react";

export default function ChunksPage() {
  const [mode, setMode] = useState("id");
  const [inputId, setInputId] = useState("899daae2-1ca3-4453-ac0d-01ac97015972");
  const [inputLawId, setInputLawId] = useState("");
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [totalLoading, setTotalLoading] = useState(true);

  // Lấy tổng số documents khi render lần đầu
  useEffect(() => {
    async function fetchTotal() {
      try {
        const res = await fetch("/api/findfirestore?countOnly=true");
        const json = await res.json();
        if (json.success) setTotalCount(json.total);
      } catch {
        setTotalCount(null);
      } finally {
        setTotalLoading(false);
      }
    }
    fetchTotal();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let url = "/api/findfirestore";
      if (mode === "id") url += `?id=${encodeURIComponent(inputId)}`;
      else if (mode === "lawId") url += `?lawId=${encodeURIComponent(inputLawId)}&limit=${limit}`;
      else url += `?limit=${limit}`;

      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>🔍 Firestore Chunks Viewer</h1>
          <p style={styles.subtitle}>Collection: <code style={styles.code}>chunks</code></p>
        </div>

        {/* Thống kê tổng */}
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Tổng documents</div>
          {totalLoading ? (
            <div style={styles.statValueLoading}>Đang đếm...</div>
          ) : totalCount !== null ? (
            <div style={styles.statValue}>{totalCount.toLocaleString("vi-VN")}</div>
          ) : (
            <div style={styles.statValueError}>—</div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <div style={styles.card}>
        <div style={styles.modeRow}>
          {["id", "lawId", "all"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{ ...styles.modeBtn, ...(mode === m ? styles.modeBtnActive : {}) }}
            >
              {m === "id" ? "Theo _id" : m === "lawId" ? "Theo lawId" : "Tất cả"}
            </button>
          ))}
        </div>

        <div style={styles.inputRow}>
          {mode === "id" && (
            <input
              style={styles.input}
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="_id (UUID)"
            />
          )}
          {mode === "lawId" && (
            <input
              style={styles.input}
              value={inputLawId}
              onChange={(e) => setInputLawId(e.target.value)}
              placeholder="lawId (vd: 03/2026/TT-BDTTG)"
            />
          )}
          {mode !== "id" && (
            <input
              style={{ ...styles.input, width: 80, flex: "none" }}
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              placeholder="Limit"
              min={1}
              max={100}
            />
          )}
          <button onClick={fetchData} style={styles.fetchBtn} disabled={loading}>
            {loading ? "Đang tải..." : "Lấy dữ liệu"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div style={styles.errorBox}>❌ {error}</div>}

      {/* Results */}
      {data && (
        <>
          <div style={styles.resultMeta}>
            Tìm thấy <strong>{data.count}</strong> document{data.count !== 1 ? "s" : ""}
            {totalCount !== null && (
              <span style={styles.resultMetaSub}> / {totalCount.toLocaleString("vi-VN")} tổng</span>
            )}
          </div>

          {data.data.length === 0 && (
            <div style={styles.emptyBox}>Không tìm thấy document nào.</div>
          )}

          {data.data.map((item) => {
            const key = item.docId;
            const isExpanded = expandedId === key;
            return (
              <div key={key} style={styles.docCard}>
                <div style={styles.docHeader} onClick={() => setExpandedId(isExpanded ? null : key)}>
                  <div>
                    <span style={styles.lawIdBadge}>{item.lawId || "—"}</span>
                    <span style={styles.articleText}>{item.article || "—"}</span>
                  </div>
                  <span style={styles.chevron}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {isExpanded && (
                  <div style={styles.docBody}>
                    <Field label="_id" value={item._id} mono />
                    <Field label="Firestore docId" value={item.docId} mono />
                    <Field label="lawId" value={item.lawId} />
                    <Field label="article" value={item.article} />
                    <Field label="lawDescription" value={item.lawDescription} />
                    <Field label="lawDayActive" value={formatDate(item.lawDayActive)} />
                    <Field label="lawdateSign" value={formatDate(item.lawdateSign)} />
                    <Field label="textChunk" value={item.textChunk ?? "null"} />
                    <Field label="embedding" value={item.embedding} mono />
                    <div style={styles.fieldGroup}>
                      <span style={styles.fieldLabel}>fullText</span>
                      <div style={styles.fullTextBox}>{item.fullText || "—"}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div style={styles.fieldGroup}>
      <span style={styles.fieldLabel}>{label}</span>
      <span style={mono ? { ...styles.fieldValue, ...styles.mono } : styles.fieldValue}>
        {value ?? "—"}
      </span>
    </div>
  );
}

const styles = {
  container: { maxWidth: 860, margin: "0 auto", padding: "32px 16px", fontFamily: "system-ui, sans-serif" },

  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4, color: "#111" },
  subtitle: { color: "#666", fontSize: 14, margin: 0 },
  code: { background: "#f0f0f0", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" },

  statBox: {
    background: "#eff6ff", borderWidth: 1, borderStyle: "solid", borderColor: "#bfdbfe",
    borderRadius: 10, padding: "12px 20px", textAlign: "center", minWidth: 140,
  },
  statLabel: { fontSize: 11, color: "#3b82f6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 700, color: "#1d4ed8", lineHeight: 1 },
  statValueLoading: { fontSize: 13, color: "#93c5fd", fontStyle: "italic" },
  statValueError: { fontSize: 20, color: "#93c5fd" },

  card: { background: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: "#e5e7eb", borderRadius: 10, padding: 20, marginBottom: 20 },
  modeRow: { display: "flex", gap: 8, marginBottom: 16 },
  modeBtn: {
    padding: "6px 14px", borderRadius: 6,
    borderWidth: 1, borderStyle: "solid", borderColor: "#d1d5db",
    background: "#f9fafb", cursor: "pointer", fontSize: 13, color: "#374151",
  },
  modeBtnActive: { background: "#2563eb", color: "#fff", borderColor: "#2563eb" },
  inputRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  input: {
    flex: 1, minWidth: 200, padding: "8px 12px",
    borderWidth: 1, borderStyle: "solid", borderColor: "#d1d5db",
    borderRadius: 6, fontSize: 14, outline: "none",
  },
  fetchBtn: {
    padding: "8px 20px", background: "#2563eb", color: "#fff",
    borderWidth: 0, borderStyle: "solid", borderColor: "transparent",
    borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600,
  },

  errorBox: { background: "#fef2f2", borderWidth: 1, borderStyle: "solid", borderColor: "#fca5a5", borderRadius: 8, padding: 14, color: "#b91c1c", marginBottom: 16 },
  emptyBox: { textAlign: "center", color: "#9ca3af", padding: 40 },
  resultMeta: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
  resultMetaSub: { color: "#9ca3af" },

  docCard: { borderWidth: 1, borderStyle: "solid", borderColor: "#e5e7eb", borderRadius: 10, marginBottom: 12, overflow: "hidden" },
  docHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", cursor: "pointer", background: "#f9fafb", userSelect: "none",
  },
  lawIdBadge: {
    background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 600,
    padding: "2px 8px", borderRadius: 4, marginRight: 10,
  },
  articleText: { fontSize: 14, color: "#111", fontWeight: 500 },
  chevron: { color: "#9ca3af", fontSize: 12 },

  docBody: { padding: "16px", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "#e5e7eb", display: "flex", flexDirection: "column", gap: 10 },
  fieldGroup: { display: "flex", gap: 8, alignItems: "flex-start" },
  fieldLabel: { minWidth: 140, fontSize: 12, color: "#6b7280", fontWeight: 600, paddingTop: 1 },
  fieldValue: { fontSize: 13, color: "#111", wordBreak: "break-all" },
  mono: { fontFamily: "monospace", fontSize: 12, color: "#6b7280" },
  fullTextBox: {
    flex: 1, background: "#f8fafc",
    borderWidth: 1, borderStyle: "solid", borderColor: "#e5e7eb",
    borderRadius: 6, padding: "10px 12px", fontSize: 13, lineHeight: 1.7,
    color: "#374151", whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
};