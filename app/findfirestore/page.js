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

  // ── Thêm lawId ──
  const [addLawId, setAddLawId] = useState("");
  const [addContent, setAddContent] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [addError, setAddError] = useState(null);

  // ── Xóa lawId ──
  const [deleteLawId, setDeleteLawId] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Utility parse response an toàn
async function safeJson(res) {
  const text = await res.text();
  if (!text || text.trim() === "") {
    throw new Error(`Server trả về response rỗng (status ${res.status})`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Response không phải JSON: ${text.slice(0, 200)}`);
  }
}

  useEffect(() => {
async function fetchTotal() {
  try {
    const res = await fetch("/api/findfirestore?countOnly=true");
    const json = await safeJson(res);  // ← thay ở đây
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
    const json = await safeJson(res);  // ← thay ở đây
    if (!json.success) throw new Error(json.error);
    setData(json);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

async function handleAdd() {
  setAddLoading(true);
  setAddResult(null);
  setAddError(null);
  try {
    const res = await fetch("/api/findfirestore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lawId: addLawId, content: addContent }),
    });
    const json = await safeJson(res);  // ← thay ở đây
    if (!json.success) throw new Error(json.error);
    setAddResult(json);
    setAddLawId("");
    setAddContent("");
    const res2 = await fetch("/api/findfirestore?countOnly=true");
    const json2 = await safeJson(res2);  // ← thay ở đây
    if (json2.success) setTotalCount(json2.total);
  } catch (err) {
    setAddError(err.message);
  } finally {
    setAddLoading(false);
  }
}

async function handleDelete() {
  if (!deleteConfirm) {
    setDeleteConfirm(true);
    return;
  }
  setDeleteLoading(true);
  setDeleteResult(null);
  setDeleteError(null);
  setDeleteConfirm(false);
  try {
    const res = await fetch(
      `/api/findfirestore?lawId=${encodeURIComponent(deleteLawId)}`,
      { method: "DELETE" }
    );
    const json = await safeJson(res);  // ← thay ở đây
    if (!json.success) throw new Error(json.error);
    setDeleteResult(json);
    setDeleteLawId("");
    const res2 = await fetch("/api/findfirestore?countOnly=true");
    const json2 = await safeJson(res2);  // ← thay ở đây
    if (json2.success) setTotalCount(json2.total);
  } catch (err) {
    setDeleteError(err.message);
  } finally {
    setDeleteLoading(false);
  }
}
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  }

  const isViewMode = ["id", "lawId", "all"].includes(mode);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>🔍 MongoDB Chunks Viewer</h1>
          <p style={styles.subtitle}>Collection: <code style={styles.code}>ragdb.chunks</code></p>
        </div>
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

      {/* Tab bar */}
      <div style={styles.tabBar}>
        {[
          { key: "id", label: "Theo _id" },
          { key: "lawId", label: "Theo lawId" },
          { key: "all", label: "Tất cả" },
          { key: "add", label: "➕ Thêm" },
          { key: "delete", label: "🗑️ Xóa" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setMode(t.key);
              setDeleteConfirm(false);
              setAddResult(null);
              setDeleteResult(null);
            }}
            style={{
              ...styles.tabBtn,
              ...(mode === t.key ? styles.tabBtnActive : {}),
              ...(t.key === "delete" && mode === t.key ? styles.tabBtnDanger : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── View modes ── */}
      {isViewMode && (
        <div style={styles.card}>
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
      )}

      {/* ── Tab Thêm ── */}
      {mode === "add" && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Thêm lawId mới</h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>lawId</label>
            <input
              style={styles.input}
              value={addLawId}
              onChange={(e) => setAddLawId(e.target.value)}
              placeholder="vd: 03/2026/TT-BDTTG"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nội dung (content / fullText)</label>
            <textarea
              style={styles.textarea}
              value={addContent}
              onChange={(e) => setAddContent(e.target.value)}
              placeholder="Nhập nội dung văn bản..."
              rows={10}
            />
          </div>
          <button
            onClick={handleAdd}
            style={styles.fetchBtn}
            disabled={addLoading || !addLawId.trim() || !addContent.trim()}
          >
            {addLoading ? "Đang thêm..." : "Thêm"}
          </button>

          {addError && <div style={{ ...styles.errorBox, marginTop: 16 }}>❌ {addError}</div>}
          {addResult && (
            <div style={styles.successBox}>
              ✅ Thêm thành công — {addResult.count ?? 1} chunk(s) được tạo
            </div>
          )}
        </div>
      )}

      {/* ── Tab Xóa ── */}
      {mode === "delete" && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Xóa theo lawId</h2>
          <p style={styles.deleteWarning}>
            ⚠️ Thao tác này sẽ xóa <strong>toàn bộ</strong> documents có lawId tương ứng và không thể hoàn tác.
          </p>
          <div style={styles.formGroup}>
            <label style={styles.label}>lawId cần xóa</label>
            <input
              style={{ ...styles.input, borderColor: deleteConfirm ? "#ef4444" : "#d1d5db" }}
              value={deleteLawId}
              onChange={(e) => { setDeleteLawId(e.target.value); setDeleteConfirm(false); }}
              placeholder="vd: 03/2026/TT-BDTTG"
            />
          </div>

          {deleteConfirm && (
            <div style={styles.confirmBox}>
              Xác nhận xóa tất cả documents với lawId <strong>"{deleteLawId}"</strong>?
            </div>
          )}

          <div style={styles.inputRow}>
            <button
              onClick={handleDelete}
              style={{
                ...styles.deleteBtn,
                opacity: !deleteLawId.trim() || deleteLoading ? 0.5 : 1,
              }}
              disabled={!deleteLawId.trim() || deleteLoading}
            >
              {deleteLoading ? "Đang xóa..." : deleteConfirm ? "✅ Xác nhận xóa" : "🗑️ Xóa"}
            </button>
            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                style={styles.cancelBtn}
              >
                Hủy
              </button>
            )}
          </div>

          {deleteError && <div style={{ ...styles.errorBox, marginTop: 16 }}>❌ {deleteError}</div>}
          {deleteResult && (
            <div style={styles.successBox}>
              ✅ Đã xóa <strong>{deleteResult.deleted}</strong> document(s) với lawId "{deleteResult.lawId}"
            </div>
          )}
        </div>
      )}

      {/* Error (view modes) */}
      {error && isViewMode && <div style={styles.errorBox}>❌ {error}</div>}

      {/* Results */}
      {data && isViewMode && (
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
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4, color: "#ffffff" },
  subtitle: { color: "#666", fontSize: 14, margin: 0 },
  code: { background: "#f0f0f0", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" },

  statBox: { background: "#eff6ff", borderWidth: 1, borderStyle: "solid", borderColor: "#bfdbfe", borderRadius: 10, padding: "12px 20px", textAlign: "center", minWidth: 140 },
  statLabel: { fontSize: 11, color: "#3b82f6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 700, color: "#1d4ed8", lineHeight: 1 },
  statValueLoading: { fontSize: 13, color: "#93c5fd", fontStyle: "italic" },
  statValueError: { fontSize: 20, color: "#93c5fd" },

  tabBar: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  tabBtn: { padding: "7px 16px", borderRadius: 6, borderWidth: 1, borderStyle: "solid", borderColor: "#d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: 13, color: "#374151" },
  tabBtnActive: { background: "#2563eb", color: "#fff", borderColor: "#2563eb" },
  tabBtnDanger: { background: "#ef4444", color: "#fff", borderColor: "#ef4444" },

  card: { background: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: "#e5e7eb", borderRadius: 10, padding: 20, marginBottom: 20 },
  inputRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  input: { flex: 1, minWidth: 200, padding: "8px 12px", borderWidth: 1, borderStyle: "solid", borderColor: "#d1d5db", borderRadius: 6, fontSize: 14, outline: "none" },
  fetchBtn: { padding: "8px 20px", background: "#2563eb", color: "#fff", borderWidth: 0, borderStyle: "solid", borderColor: "transparent", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 },
  deleteBtn: { padding: "8px 20px", background: "#ef4444", color: "#fff", borderWidth: 0, borderStyle: "solid", borderColor: "transparent", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 },
  cancelBtn: { padding: "8px 20px", background: "#f3f4f6", color: "#374151", borderWidth: 1, borderStyle: "solid", borderColor: "#d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#111", marginTop: 0, marginBottom: 16 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 600, color: "#6b7280" },
  textarea: { padding: "10px 12px", borderWidth: 1, borderStyle: "solid", borderColor: "#d1d5db", borderRadius: 6, fontSize: 13, fontFamily: "monospace", resize: "vertical", outline: "none", lineHeight: 1.6 },

  deleteWarning: { background: "#fef9c3", borderWidth: 1, borderStyle: "solid", borderColor: "#fde047", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#713f12", marginBottom: 16 },
  confirmBox: { background: "#fef2f2", borderWidth: 1, borderStyle: "solid", borderColor: "#fca5a5", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 12 },
  successBox: { background: "#f0fdf4", borderWidth: 1, borderStyle: "solid", borderColor: "#86efac", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#15803d", marginTop: 16 },
  errorBox: { background: "#fef2f2", borderWidth: 1, borderStyle: "solid", borderColor: "#fca5a5", borderRadius: 8, padding: 14, color: "#b91c1c", marginBottom: 16 },
  emptyBox: { textAlign: "center", color: "#9ca3af", padding: 40 },
  resultMeta: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
  resultMetaSub: { color: "#9ca3af" },

  docCard: { borderWidth: 1, borderStyle: "solid", borderColor: "#e5e7eb", borderRadius: 10, marginBottom: 12, overflow: "hidden" },
  docHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer", background: "#f9fafb", userSelect: "none" },
  lawIdBadge: { background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 4, marginRight: 10 },
  articleText: { fontSize: 14, color: "#111", fontWeight: 500 },
  chevron: { color: "#9ca3af", fontSize: 12 },

  docBody: { padding: "16px", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "#e5e7eb", display: "flex", flexDirection: "column", gap: 10 },
  fieldGroup: { display: "flex", gap: 8, alignItems: "flex-start" },
  fieldLabel: { minWidth: 140, fontSize: 12, color: "#6b7280", fontWeight: 600, paddingTop: 1 },
  fieldValue: { fontSize: 13, color: "#111", wordBreak: "break-all" },
  mono: { fontFamily: "monospace", fontSize: 12, color: "#6b7280" },
  fullTextBox: { flex: 1, background: "#f8fafc", borderWidth: 1, borderStyle: "solid", borderColor: "#e5e7eb", borderRadius: 6, padding: "10px 12px", fontSize: 13, lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap", wordBreak: "break-word" },
};