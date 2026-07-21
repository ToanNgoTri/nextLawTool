// app/api/ask/route.js
import { getChunksCollection, VECTOR_INDEX, VECTOR_FIELD } from "../../lib/mongoRag";

const TOP_K = 5;

async function findRelevantDocs(queryEmbedding) {
  const collection = await getChunksCollection();

  // Vector search bằng Atlas/Mongo $vectorSearch (cosine, index sẵn có).
  // numCandidates nên lớn hơn limit nhiều lần để tăng độ chính xác (recall).
  const docs = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: VECTOR_INDEX,
          path: VECTOR_FIELD,
          queryVector: queryEmbedding,
          numCandidates: Math.max(TOP_K * 30, 100),
          limit: TOP_K,
        },
      },
      {
        $project: {
          _id: 1,
          article: 1,
          fullText: 1,
          lawId: 1,
          lawDescription: 1,
          lawDayActive: 1,
          lawdateSign: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ])
    .toArray();

  return docs.map((d) => ({
    id: d._id,
    article: d.article,
    fullText: d.fullText,
    lawId: d.lawId,
    lawDescription: d.lawDescription,
    lawDayActive: d.lawDayActive,
    lawdateSign: d.lawdateSign,
    score: d.score,
  }));
}

// const MODELS = [
//   "google/gemma-4-31b-it:free",
//   "google/gemma-4-26b-a4b-it:free",
//   "qwen/qwen3-next-80b-a3b-instruct:free",
//   "qwen/qwen3-coder:free",
//   "meta-llama/llama-3.3-70b-instruct:free",
//   "meta-llama/llama-3.2-3b-instruct:free",
//   // "qwen/qwen3-embedding-8b"
// ];


// async function callLLMWithFallback(systemPrompt, messages) {
//   for (const model of MODELS) {
//     console.log(`Thử model: ${model}`);

//     const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.OPENROUTER_API_KEY_SELF_USE}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model,
//         stream: true,
//         temperature: 0.2,
//         max_tokens: 500,
//         messages: [{ role: "system", content: systemPrompt }, ...messages],
//       }),
//     });

//     if (res.status === 429) {
//       const errText = await res.text().catch(() => "");
//       console.warn(
//         `Model ${model} bị rate limit (429), thử model tiếp theo...`,
//         errText,
//       );
//       continue;
//     }

//     if (!res.ok || !res.body) {
//       const errText = await res.text().catch(() => "(không đọc được body)");
//       console.error(`Model ${model} lỗi - status: ${res.status}`, errText);
//       // Lỗi khác 429 thì throw luôn, không fallback
//       throw Object.assign(new Error("Lỗi gọi LLM"), {
//         status: res.status,
//         detail: errText,
//       });
//     }

//     console.log(`Dùng model: ${model}`);
//     return res;
//   }

//   throw Object.assign(new Error("Tất cả model đều bị rate limit"), {
//     status: 429,
//     detail: "Vui lòng thử lại sau ít phút.",
//   });
// }


const PROVIDERS = {
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    headers: () => ({
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY_SELF_USE}`,
      "Content-Type": "application/json",
    }),
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    headers: () => ({
      Authorization: `Bearer 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`,
      "Content-Type": "application/json",
    }),
  },
};

const MODELS = [
  { provider: "openrouter", model: "google/gemma-4-31b-it:free" },
  { provider: "openrouter", model: "google/gemma-4-26b-a4b-it:free" },
  { provider: "openrouter", model: "qwen/qwen3-next-80b-a3b-instruct:free" },
  { provider: "openrouter", model: "qwen/qwen3-coder:free" },
  { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct:free" },
  { provider: "openrouter", model: "meta-llama/llama-3.2-3b-instruct:free" },
  { provider: "nvidia", model: "qwen/qwen3.5-122b-a10b" },
];

async function callLLMWithFallback(systemPrompt, messages) {
  for (const { provider, model } of MODELS) {
    const cfg = PROVIDERS[provider];
    console.log(`Thử model: ${provider}/${model}`);

    let res;
    try {
      res = await fetch(cfg.url, {
        method: "POST",
        headers: { ...cfg.headers(), Accept: "text/event-stream" },
        body: JSON.stringify({
          model,
          stream: true,
          temperature: 0.2,
          max_tokens: 500,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
        }),
      });
    } catch (networkErr) {
      console.error(`Model ${provider}/${model} lỗi network:`, networkErr.message);
      continue;
    }

    // Chốt chặn: nếu vì lý do gì đó res vẫn undefined/null thì coi như lỗi, không crash
    if (!res) {
      console.error(`Model ${provider}/${model}: fetch trả về res rỗng, bỏ qua`);
      continue;
    }

    if (res.status === 429) {
      const errText = await res.text().catch(() => "");
      console.warn(`Model ${provider}/${model} bị rate limit (429), thử model tiếp theo...`, errText);
      continue;
    }

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => "(không đọc được body)");
      console.error(`Model ${provider}/${model} lỗi - status: ${res.status}`, errText);
      throw Object.assign(new Error("Lỗi gọi LLM"), { status: res.status, detail: errText });
    }

    console.log(`Dùng model: ${provider}/${model}`);
    return res;
  }

  throw Object.assign(new Error("Tất cả model đều bị rate limit"), {
    status: 429,
    detail: "Vui lòng thử lại sau ít phút.",
  });
}

export async function POST(req) {
  try {
    const { question, embedding, messages } = await req.json();

    if (!embedding || !Array.isArray(embedding)) {
      return new Response(JSON.stringify({ error: "Thiếu embedding" }), {
        status: 400,
      });
    }

    // 1. Vector search
    const relevantDocs = await findRelevantDocs(embedding);

      
    const context = relevantDocs
      .map(
        (d, i) =>
          `[${d.fullText}\nVăn bản ký ngày ${new Date(d.lawdateSign).toLocaleDateString("vi-VN")} có hiệu lực ngày ${new Date(d.lawDayActive).toLocaleDateString("vi-VN")}]`,
      )
      .join("\n\n");

    // console.log("context", context);

    // 2. Tạo system prompt
    const systemPrompt = `Bạn là AI tư vấn pháp luật Việt Nam.
Nhiệm vụ:
- Chỉ dùng thông tin trong CONTEXT bên dưới.
- Trả lời NGẮN GỌN, dễ hiểu.
- Hãy diễn giải lại bằng ngôn ngữ tự nhiên.

Khi câu trả lời có căn cứ pháp luật:
1. Luôn nêu căn cứ trước.
2. Ghi theo mẫu:
   "Căn cứ [Tên văn bản NGUYÊN VĂN] số [Số văn bản] ngày ...., có hiệu lực từ ngày ... .
   Điều [chữ số La tinh]. [ghi rõ nội dung trích yếu]:
   [[1|2|3]. nội dung cụ thể ]... (nếu 1 không liên quan thì bỏ luôn bắt đầu từ [2|3] )
2. Sau đó mới giải thích nội dung bằng lời văn tự nhiên, bằng mở đầu: tóm lại, nói chung, theo đó, do đó, vì vậy, kết luận là, ... (tùy ngữ cảnh).
3. Nếu câu hỏi không liên quan đến pháp luật Việt Nam thì trả lời: "Không tìm thấy thông tin phù hợp."
4. Không được bịa số điều, khoản hoặc tên văn bản. Chỉ sử dụng thông tin có trong CONTEXT.

Định dạng đầu ra:
- Chỉ được xuất plain text.
- Cấm sử dụng các ký tự Markdown như *, **, #, -, _, >.

Nếu không đủ thông tin thì trả lời:
"Không tìm thấy thông tin phù hợp."

CONTEXT:
${context}`;

    // 3. Gọi LLM với fallback tự động
    const llmRes = await callLLMWithFallback(systemPrompt, messages);

    // 4. Trả stream về frontend
    return new Response(llmRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    return "abc";
  } catch (error) {
    console.error("Lỗi /api/ask:", error);

    const status = error.status === 429 ? 429 : 500;
    return new Response(
      JSON.stringify({
        error: error.message || "Server error",
        detail: error.detail || "",  // "Vui lòng thử lại sau ít phút."
      }),
      { status, headers: { "Content-Type": "application/json" } },
    );
  }
}
