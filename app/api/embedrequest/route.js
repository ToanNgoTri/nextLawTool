import { MongoClient } from "mongodb"

const client = new MongoClient(
  "mongodb://thuvienphapluat:ZvQn9683p8NnPXFMdR1VX53HTK3Da1WqyXJpvtgMMASTRdDkyu87lFAL7aR5DiiN@46.225.145.42:6980/?directConnection=true"
)

async function embed(text) {

  const res = await fetch(
    "http://localhost:11434/api/embeddings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "bge-m3",
        prompt: text
      })
    }
  )

  const data = await res.json()

  return data.embedding
}

export async function GET() {

  await client.connect()

//   const db = client.db("LawMachine")

//   const laws = db.collection("LawCollection")

  // document gốc của bạn
  const question = "Thông tư nào hết hiệu lực khi  14/2024/TT-BVHTTDL có hiệu lực thi hành?"

    const vector = await embed(question)


return Response.json(vector)

}

