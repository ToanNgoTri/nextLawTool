// scripts/extractLawChunks.js

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";

// =========================
// LOAD DATA
// =========================

const dbPath = path.join(process.cwd(), "app/asset/hinhsu.json");

const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const OUTPUT_FILE = path.join(process.cwd(), "app/asset/lawChunks.json");

// =========================
// REGEX
// =========================

const REGEX = {
  article: /^Điều\s+\d+[a-zA-ZđĐ]*([:.]|$)/i,
};


function cleanText(text = "") {
  if (text == null) return "";

  if (typeof text !== "string") {
    try {
      text = JSON.stringify(text);
    } catch {
      text = String(text);
    }
  }

  return text
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}



function createChunk({
  law,
  article,
  content,
}) {
  return {
    _id: crypto.randomUUID(),

    lawId: law._id,

    lawNumber: law?.info?.lawNumber || "",

    lawDescription:
      law?.info?.lawDescription || "",

    article,

    fullText: [
      law?.info?.lawDescription,
      article,
      content,
    ]
      .filter(Boolean)
      .join("\n"),

    embedding: null,
  };
}
// =========================
// PARSE ARTICLE
// =========================

function parseArticle({
  law,
  articleTitle,
  articleContent,
}) {
  return [
    createChunk({
      law,
      article: articleTitle,
      content: cleanText(articleContent),
    }),
  ];
}
// =========================
// WALK NODE (RECURSIVE)
// =========================

function walkNode({
  node,
  law,
  chunks,
}) {
  if (node == null) return;

  // string
  if (typeof node === "string") {
    const value = cleanText(node);

    if (!value) return;

    chunks.push(
      createChunk({
        law,
        article: "",
        content: value,
      }),
    );

    return;
  }

  // array
  if (Array.isArray(node)) {
    for (const item of node) {
      walkNode({
        node: item,
        law,
        chunks,
      });
    }

    return;
  }

  // object
  if (typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      const title = cleanText(key);

      // Điều
      if (
        REGEX.article.test(title) &&
        typeof value === "string"
      ) {
        chunks.push(
          ...parseArticle({
            law,
            articleTitle: title,
            articleContent: value,
          }),
        );

        continue;
      }

      // mục 2.1, 2.2...
      if (typeof value === "string") {
        chunks.push(
          createChunk({
            law,
            article: title,
            content: cleanText(value),
          }),
        );

        continue;
      }

      walkNode({
        node: value,
        law,
        chunks,
      });
    }
  }
}
// =========================
// EXTRACT
// =========================

export function extractChunksFromLaw(law) {
  const chunks = [];

  walkNode({
    node: law.content,
    law,
    chunks,
  });

  return chunks;
}
// =========================
// MAIN
// =========================

async function main() {
  try {
    const laws = database;

    console.log(`📚 Total laws: ${laws.length}`);

    let allChunks = [];

    // clear file cũ trước
    fs.writeFileSync("app/asset/embedded.jsonl", "");

    for (const law of laws) {
      try {
        const chunks = extractChunksFromLaw(law);

        allChunks.push(...chunks);

        console.log(`✅ ${law._id} -> ${chunks.length} chunks`);
      } catch (err) {
        console.error(`❌ ERROR ${law._id}`);
        console.error(err);
        process.exit(1);
      }
    }

    console.log(`🧩 Total chunks: ${allChunks.length}`);

        fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(allChunks, null, 2),
      "utf8"
    );

    for (const obj of allChunks) {
      if (!obj?.fullText) continue;
      // console.log(`🔍 fullText chunk: ${obj.fullText || obj._id}`);
      try {
        const res = await fetch("http://localhost:11434/api/embeddings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "bge-m3",
            prompt: obj.fullText,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ Ollama error:", errText);
          continue;
        }

        const data = await res.json();

        const record = {
          ...obj,
          embedding: data.embedding,
        };

        // 🔥 WRITE NGAY LẬP TỨC
        fs.appendFileSync(
          "app/asset/embedded.jsonl",
          JSON.stringify(record) + "\n",
          "utf8"
        );

        console.log(`💾 written chunk: ${obj.fullText || obj._id}`);

      } catch (err) {
        console.error("❌ embed error:", err);
      }
    }

    console.log("🎉 Done streaming embed");
  } catch (err) {
    console.error(err);
  }
} // =========================
// NEXT API
// =========================

export async function GET(req) {
  // const chunks = await main();


  const jsonl = fs.readFileSync(
  "app/asset/embedded.jsonl",
  "utf8"
);

const data = jsonl
  .split("\n")
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

fs.writeFileSync(
  "app/asset/embedded1.json",
  JSON.stringify(data, null, 2),
  "utf8"
);

console.log(`✅ Converted ${data.length} records`);

  return NextResponse.json({
    // total: chunks.length,
  });
}
