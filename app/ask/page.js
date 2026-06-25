"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // đang embed hoặc chờ token đầu
  const [streaming, setStreaming] = useState(false); // đang nhận tokens
  const bottomRef = useRef(null);

  // Auto scroll xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function embed(text) {
    const res = await fetch("https://ollama.pixelplaces.net/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "bge-m3", input: text }),
    });
    const data = await res.json();
    return data.embeddings[0];
  }

  async function askAI() {
    if (!question.trim() || loading || streaming) return;

    const userMessage = { role: "user", content: question };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      const vector = await embed(question);

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          embedding: vector,
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        // Đọc lỗi từ server thay vì hardcode
        const errData = await res.json().catch(() => ({}));
        const errMsg =
          res.status === 429
            ? `Tất cả model đang bận. ${errData.detail || "Thử lại sau ít phút."}`
            : errData.error || "Có lỗi xảy ra, thử lại nhé.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errMsg },
        ]);
        setLoading(false);
        return;
      }

      setLoading(false);
      setStreaming(true);

      // Thêm placeholder cho assistant
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // giữ dòng chưa kết thúc

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;

          try {
            const json = JSON.parse(raw);
            const token = json.choices?.[0]?.delta?.content;
            if (token) {
              // Append token vào message cuối
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + token,
                };
                return updated;
              });
            }
          } catch (_) {}
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Có lỗi xảy ra, thử lại nhé.",
        },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  const isDisabled = loading || streaming;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1>AI Luật</h1>

      {/* CHAT */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                background: msg.role === "user" ? "#2563eb" : "#e5e7eb",
                color: msg.role === "user" ? "white" : "black",
                padding: 12,
                borderRadius: 12,
                maxWidth: "70%",
                whiteSpace: "pre-wrap",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 5 }}>
                {msg.role === "user" ? "Bạn" : "AI"}
              </div>
              <div>
                {msg.content}
                {/* Blinking cursor trên message cuối khi đang stream */}
                {streaming &&
                  index === messages.length - 1 &&
                  msg.role === "assistant" && (
                    <span style={cursorStyle}>▌</span>
                  )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading bubble — hiện khi embed xong, chờ token đầu tiên */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: "#e5e7eb",
                padding: "12px 18px",
                borderRadius: 12,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <Dot delay="0s" />
              <Dot delay="0.2s" />
              <Dot delay="0.4s" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Nhập câu hỏi..."
          onKeyDown={(e) => e.key === "Enter" && askAI()}
          disabled={isDisabled}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            opacity: isDisabled ? 0.6 : 1,
          }}
        />
        <button
          onClick={askAI}
          disabled={isDisabled}
          style={{
            padding: "12px 20px",
            background: isDisabled ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Đang xử lý..." : streaming ? "Đang trả lời..." : "Hỏi"}
        </button>
      </div>
    </div>
  );
}

// Animated dot cho loading bubble
function Dot({ delay }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#6b7280",
        display: "inline-block",
        animation: "bounce 1.2s infinite",
        animationDelay: delay,
      }}
    />
  );
}

const cursorStyle = {
  display: "inline-block",
  animation: "blink 1s step-end infinite",
  marginLeft: 1,
};

// Inject keyframes vào head (chỉ chạy 1 lần phía client)
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
  `;
  document.head.appendChild(style);
}
