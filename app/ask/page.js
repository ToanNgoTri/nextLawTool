"use client";

import { useState } from "react";

export default function Home() {

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  async function embed(text) {

    const res = await fetch(
      "http://localhost:11434/api/embeddings",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          model: "bge-m3",
          prompt: text
        })
      }
    );

    const data = await res.json();

    return data.embedding;
  }

  async function askAI() {

    if (!question.trim()) return;

    // user message
    const userMessage = {
      role: "user",
      content: question
    };

    // hiện user ngay
    const newMessages = [
      ...messages,
      userMessage
    ];

    setMessages(newMessages);

    const currentQuestion = question;

    setQuestion("");

    try {

      const vector =
        await embed(currentQuestion);

      const res = await fetch(
        "/api/ask",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question: currentQuestion,

            embedding: vector,

            // gửi history lên backend
            messages: newMessages
          }),
        }
      );

      const data = await res.json();

      console.log('data',data);
      // thêm assistant message
      setMessages([
        ...newMessages,

        {
          role: "assistant",
          content: data.answer
        }
      ]);

    } catch (error) {

      setMessages([
        ...newMessages,

        {
          role: "assistant",
          content: "Có lỗi xảy ra"
        }
      ]);

      console.log(error);
    }
  }

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 900,
        margin: "auto"
      }}
    >

      <h1>AI Luật</h1>

      {/* CHAT */}

      <div
        style={{
          marginTop: 20,
          marginBottom: 20
        }}
      >

        {messages.map((msg, index) => (

          <div
            key={index}

            style={{
              marginBottom: 16,

              display: "flex",

              justifyContent:
                msg.role === "user"
                  ? "flex-end"
                  : "flex-start"
            }}
          >

            <div
              style={{
                background:
                  msg.role === "user"
                    ? "#2563eb"
                    : "#e5e7eb",

                color:
                  msg.role === "user"
                    ? "white"
                    : "black",

                padding: 12,

                borderRadius: 12,

                maxWidth: "70%"
              }}
            >

              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 5
                }}
              >
                {msg.role === "user"
                  ? "Bạn"
                  : "AI"}
              </div>

              <div>
                {msg.content}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}

      <div
        style={{
          display: "flex",
          gap: 10
        }}
      >

        <input
          value={question}

          onChange={(e) =>
            setQuestion(e.target.value)
          }

          placeholder="Nhập câu hỏi"

          onKeyDown={(e) =>
            e.key === "Enter" &&
            askAI()
          }

          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border:
              "1px solid #ccc"
          }}
        />

        <button
          onClick={askAI}

          style={{
            padding:
              "12px 20px"
          }}
        >
          Hỏi
        </button>

      </div>
    </div>
  );
}