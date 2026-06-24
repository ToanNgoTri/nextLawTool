"use client";

const pages = [
  { href: "/once",          label: "Once",           desc: "Xử lý văn bản đơn lẻ" },
  { href: "/check",         label: "Check",          desc: "Kiểm tra & đối chiếu" },
  { href: "/ask",           label: "Ask",            desc: "Tra cứu AI pháp luật" },
  { href: "/findfirestore", label: "Find Firestore", desc: "Tìm kiếm dữ liệu chunks" },
];

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚖️</div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>LawMachine</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Hệ thống quản lý pháp luật — bảng điều khiển</p>
        </div>
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Chức năng chính</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {pages.map(p => (
          <a key={p.href} href={p.href} target="_blank" rel="noopener noreferrer"
            style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{p.label}</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{p.desc}</span>
          </a>
        ))}
      </div>
    </div>
  );
}