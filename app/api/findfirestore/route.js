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
  const id = searchParams.get("id");         // lọc theo field _id (UUID string)
  const lawId = searchParams.get("lawId");   // lọc theo lawId
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  try {
    let snapshot;

    if (id) {
      // Tìm document có field _id == uuid
      snapshot = await db
        .collection("chunks")
        .where("_id", "==", id)
        .limit(1)
        .get();
    } else if (lawId) {
      snapshot = await db
        .collection("chunks")
        .where("lawId", "==", lawId)
        .limit(limit)
        .get();
    } else {
      snapshot = await db
        .collection("chunks")
        .limit(limit)
        .get();
    }

    if (searchParams.get("countOnly") === "true") {
  const countSnap = await db.collection("chunks").count().get();
  return NextResponse.json({ success: true, total: countSnap.data().count });
}

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        docId: doc.id,           // Firestore auto-generated document ID
        _id: d._id,              // UUID string field
        article: d.article,
        fullText: d.fullText,
        lawId: d.lawId,
        lawDescription: d.lawDescription,
        lawDayActive: d.lawDayActive,
        lawdateSign: d.lawdateSign,
        textChunk: d.textChunk ?? null,
        embedding: "[vector<1024>]", // bỏ qua embedding để tránh payload lớn
      };
    });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Firestore error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}