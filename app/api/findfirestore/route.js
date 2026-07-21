// app/api/findfirestore/route.js
//
// CRUD/đọc collection chunks — đã chuyển từ Firestore sang MongoDB (ragdb.chunks).
// Giữ nguyên đường dẫn API và shape response để UI không phải đổi contract.

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getChunksCollection } from "../../lib/mongoRag";

export const dynamic = "force-dynamic";

// Chỉ lấy các field cần hiển thị, bỏ embedding (nặng); trả placeholder như bản cũ.
const PROJECTION = {
  _id: 1,
  article: 1,
  fullText: 1,
  lawId: 1,
  lawDescription: 1,
  lawDayActive: 1,
  lawdateSign: 1,
  textChunk: 1,
};

function toRow(d) {
  return {
    docId: d._id, // trong Mongo, _id chính là document id
    _id: d._id,
    article: d.article ?? null,
    fullText: d.fullText ?? null,
    lawId: d.lawId ?? null,
    lawDescription: d.lawDescription ?? null,
    lawDayActive: d.lawDayActive ?? null,
    lawdateSign: d.lawdateSign ?? null,
    textChunk: d.textChunk ?? null,
    embedding: "[vector<1024>]",
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const lawId = searchParams.get("lawId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  try {
    const col = await getChunksCollection();

    if (searchParams.get("countOnly") === "true") {
      const total = await col.estimatedDocumentCount();
      return NextResponse.json({ success: true, total });
    }

    let docs;
    if (id) {
      docs = await col.find({ _id: id }, { projection: PROJECTION }).limit(1).toArray();
    } else if (lawId) {
      docs = await col.find({ lawId }, { projection: PROJECTION }).limit(limit).toArray();
    } else {
      docs = await col.find({}, { projection: PROJECTION }).limit(limit).toArray();
    }

    const data = docs.map(toRow);
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Mongo GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { lawId, content } = body;

    if (!lawId || !lawId.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu lawId" }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu content" }, { status: 400 });
    }

    const col = await getChunksCollection();
    const _id = randomUUID();

    await col.insertOne({
      _id,
      lawId: lawId.trim(),
      fullText: content.trim(),
      article: null,
      lawDescription: null,
      lawDayActive: null,
      lawdateSign: null,
      textChunk: null,
      embedding: null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, docId: _id, count: 1 });
  } catch (error) {
    console.error("Mongo POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lawId = searchParams.get("lawId");

    if (!lawId || !lawId.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu lawId" }, { status: 400 });
    }

    const col = await getChunksCollection();
    const res = await col.deleteMany({ lawId: lawId.trim() });

    if (res.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy document nào với lawId "${lawId}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: res.deletedCount, lawId });
  } catch (error) {
    console.error("Mongo DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
