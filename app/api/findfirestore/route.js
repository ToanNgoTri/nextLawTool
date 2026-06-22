// app/api/chunks/route.js

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const lawId = searchParams.get("lawId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  try {
    // countOnly phải check trước khi query snapshot
    if (searchParams.get("countOnly") === "true") {
      const countSnap = await db.collection("chunks").count().get();
      return NextResponse.json({ success: true, total: countSnap.data().count });
    }

    let snapshot;
    if (id) {
      snapshot = await db.collection("chunks").where("_id", "==", id).limit(1).get();
    } else if (lawId) {
      snapshot = await db.collection("chunks").where("lawId", "==", lawId).limit(limit).get();
    } else {
      snapshot = await db.collection("chunks").limit(limit).get();
    }

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        docId: doc.id,
        _id: d._id,
        article: d.article,
        fullText: d.fullText,
        lawId: d.lawId,
        lawDescription: d.lawDescription,
        lawDayActive: d.lawDayActive,
        lawdateSign: d.lawdateSign,
        textChunk: d.textChunk ?? null,
        embedding: "[vector<1024>]",
      };
    });

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Firestore GET error:", error);
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

    // Tạo 1 document mới trong collection chunks
    const docRef = await db.collection("chunks").add({
      _id: crypto.randomUUID(),
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

    return NextResponse.json({ success: true, docId: docRef.id, count: 1 });
  } catch (error) {
    console.error("Firestore POST error:", error);
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

    // Lấy tất cả docs có lawId này
    const snapshot = await db
      .collection("chunks")
      .where("lawId", "==", lawId.trim())
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: `Không tìm thấy document nào với lawId "${lawId}"` }, { status: 404 });
    }

    // Xóa batch (Firestore giới hạn 500 ops/batch)
    const batchSize = 500;
    const docs = snapshot.docs;
    let deleted = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      docs.slice(i, i + batchSize).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deleted += Math.min(batchSize, docs.length - i);
    }

    return NextResponse.json({ success: true, deleted, lawId });
  } catch (error) {
    console.error("Firestore DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}