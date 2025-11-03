// app/api/send-push/route.ts

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { subscriptions } from "../../../lib/subscriptionStore";
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "YOUR_PRIVATE_KEY";
webpush.setVapidDetails("mailto:you@example.com", publicKey, privateKey);


// Send a push payload to all subscribers
export async function POST(req: NextRequest) {
  try {
    const { title, body } = await req.json();

    const payload = JSON.stringify({ title, body });
    let sentCount = 0;

    for (const sub of subscriptions) {
      await webpush.sendNotification(sub, payload);
      sentCount++;
    }

    return NextResponse.json({ ok: true, sent: sentCount });
  } catch (e) {
    console.error("Push error:", e);
    return NextResponse.json({ error: "Failed to send push" }, { status: 500 });
  }
}
