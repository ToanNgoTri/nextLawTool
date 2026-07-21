// app/lib/mongoRag.js
//
// Kết nối MongoDB dùng chung cho kho vector RAG (database ragdb, collection chunks).
// Trước đây kho này nằm trên Firestore; nay đã chuyển hẳn sang MongoDB self-hosted
// có sẵn vector search index `vector_index` (path embedding, 1024 chiều, cosine).
//
// Dùng cache trên globalThis để tránh mở nhiều connection khi Next.js hot-reload
// trong môi trường dev.

import { MongoClient } from "mongodb";

export const RAG_DB = "ragdb";
export const RAG_COLLECTION = "chunks";
export const VECTOR_INDEX = "vector_index";
export const VECTOR_FIELD = "embedding";
export const VECTOR_DIMS = 1024;

const globalForMongo = globalThis;

function getClient() {
  if (!globalForMongo.__ragMongoClient) {
    globalForMongo.__ragMongoClient = new MongoClient(process.env.MONGODB_URI_RAG);
    globalForMongo.__ragMongoReady = globalForMongo.__ragMongoClient.connect();
  }
  return globalForMongo.__ragMongoReady.then(() => globalForMongo.__ragMongoClient);
}

// Trả về collection ragdb.chunks (đã đảm bảo kết nối).
export async function getChunksCollection() {
  const client = await getClient();
  return client.db(RAG_DB).collection(RAG_COLLECTION);
}
