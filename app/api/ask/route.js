// app/api/ask/route.js
import { MongoClient } from "mongodb";

const client = new MongoClient(
  "mongodb+srv://ngotritoan33:bookertandtajiri33@location.bijatuf.mongodb.net/"
);

export async function POST(req) {
  const body = await req.json();
  const history = body.messages || [];
  const question = body.question;
  const vectorRequest = body.embedding;

  await client.connect();
  const db = client.db("LawAI");
  const lawChunks = db.collection("LawChunk");

  const results = await lawChunks.aggregate([
    {
      $vectorSearch: {
        index: "lawAI",
        path: "embedding",
        queryVector: vectorRequest,
        numCandidates: 100,
        limit: 3
      }
    },
    {
      $project: { fullText: 1, score: { $meta: "vectorSearchScore" } }
    }
  ]).toArray();

  const context = results
    .map((x, i) => `[Tài liệu ${i + 1}]\n${x.fullText}`)
    .join("\n\n");

  // Gọi OpenRouter với stream: true
  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemma-4-31b-it:free",
      stream: true, // 👈 bật stream
      messages: [
        ...history,
        {
          role: "system",
          content: `Bạn là AI tư vấn pháp luật Việt Nam.
Nhiệm vụ:
- Chỉ dùng thông tin trong CONTEXT
- Trả lời NGẮN GỌN, dễ hiểu.
- KHÔNG copy nguyên văn dữ liệu.
- Hãy diễn giải lại bằng ngôn ngữ tự nhiên.
- Nếu không đủ thông tin thì nói: "Không tìm thấy thông tin phù hợp."`
        },
        {
          role: "user",
          content: `Dữ liệu tham khảo:\n${context}\n\nCâu hỏi:\n${question}\n\nHãy trả lời ngắn gọn và diễn giải lại.`
        }
      ],
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  // Pipe thẳng stream từ OpenRouter về client
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}