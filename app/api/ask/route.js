import fs from "fs";
import path from "path";
// import similarity from "cosine-similarity";
import ollama from "ollama";

// const dbPath = path.join(
//   process.cwd(),
//   "app/asset/embedded.json"
// );

// const database = JSON.parse(
//   fs.readFileSync(dbPath, "utf8")
// );

import { MongoClient } from "mongodb"
import { log } from "console";

const client = new MongoClient(
  process.env.MONGODB_URI_AI
)



export async function POST(req) {

  
  const body = await req.json();
  const history =  body.messages || [];

  const question = body.question;
  const vectorRequest = body.embedding;

  // đọc database

// function similarity(vecA, vecB) {

//   // kiểm tra vector hợp lệ
//   if (
//     !Array.isArray(vecA) ||
//     !Array.isArray(vecB)
//   ) {
//     return 0;
//   }

//   // phải cùng dimension
//   if (vecA.length !== vecB.length) {
//     return 0;
//   }

//   let dotProduct = 0;
//   let normA = 0;
//   let normB = 0;

//   for (let i = 0; i < vecA.length; i++) {

//     dotProduct += vecA[i] * vecB[i];

//     normA += vecA[i] * vecA[i];

//     normB += vecB[i] * vecB[i];
//   }

//   normA = Math.sqrt(normA);
//   normB = Math.sqrt(normB);

//   // tránh chia cho 0
//   if (normA === 0 || normB === 0) {
//     return 0;
//   }

//   return dotProduct / (normA * normB);
// }

//   // tính similarity
//   const results = database.map((item) => ({
//     content: item.content,
//     score: similarity(
//       vectorRequest,
//       item.embedding
//     )
//   }));

//   // sort điểm cao nhất
//   results.sort((a, b) => b.score - a.score);

//   // lấy top 3
//   const topResults = results.slice(0, 3);




  // ghép context
// const context = topResults
//   .map((x, index) =>
//     `[Tài liệu ${index + 1}]\n${x.content}`
//   )
//   .join("\n\n");

// const response = await ollama.chat({
//   model: "qwen3:4b",

//   messages: [

//     {
//       role: "system",
//       content: `
// Bạn là AI tư vấn pháp luật Việt Nam.

// Nhiệm vụ:
// - Trả lời NGẮN GỌN, dễ hiểu.
// - KHÔNG copy nguyên văn dữ liệu.
// - Hãy diễn giải lại bằng ngôn ngữ tự nhiên.
// - Chỉ dùng thông tin có trong dữ liệu cung cấp.
// - Nếu không đủ thông tin thì nói:
// "Không tìm thấy thông tin phù hợp."
// `
//     },

//     {
//       role: "user",
//       content: `
// Dữ liệu tham khảo:

// ${context}

// Câu hỏi:
// ${question}

// Hãy trả lời ngắn gọn và diễn giải lại.
// `
//     }
//   ]
// });
  
await client.connect();


  const db = client.db("LawAI")

  const lawChunks = db.collection("LawChunk")

  
  // const results = await lawChunks.find({}).limit(1).toArray();

const results = await lawChunks.aggregate([
  {
    $vectorSearch: {
      index: "lawAI", // là Search Index name trong Atlas
      path: "embedding",
      queryVector: vectorRequest,
      numCandidates: 100,
      limit: 1
    }
  },{
    $project: {
      fullText: 1,
      // content: 1,
      score: { $meta: "vectorSearchScore" }
    }
  }
]).toArray();

// console.log('vectorRequest',vectorRequest);
// console.log('results',results);
  
const response = await fetch(
"https://openrouter.ai/api/v1/chat/completions",
{
method: "POST",
headers: {
"Authorization": process.env.OPENROUTER_API_KEY,
"Content-Type": "application/json",
},
body: JSON.stringify({
model: "openai/gpt-4o-mini",

  messages: [
    ...history,
    {
      role: "system",
      content: `
      Bạn là AI tư vấn pháp luật Việt Nam.

Nhiệm vụ:
- Chỉ dùng thông tin trong CONTEXT
- Trả lời NGẮN GỌN, dễ hiểu.
- KHÔNG copy nguyên văn dữ liệu.
- Hãy diễn giải lại bằng ngôn ngữ tự nhiên.
- Chỉ dùng thông tin có trong dữ liệu cung cấp.
- Nếu không đủ thông tin thì nói:
"Không tìm thấy thông tin phù hợp."
`

  },

    {
      role: "user",
      content: `
 Dữ liệu tham khảo:
 ${results.map((x, index) =>{
  // console.log('x',x);
  return (
`[Tài liệu ${index + 1}]\n${x.fullText}`
 )
 }).join("\n\n")}
 
 Câu hỏi:
 ${question}
 Hãy trả lời ngắn gọn và diễn giải lại.
`
},
],
  temperature: 0.2,
  max_tokens: 500,
}),

}
);

const data = await response.json();

console.log('data',data);
return Response.json({
    answer: data.choices[0].message.content,
    // context: topResults
  });
}