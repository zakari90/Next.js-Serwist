 // app/api/subscribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { subscriptions } from "../../../../lib/subscriptionStore";

const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "YOUR_PRIVATE_KEY";

// Set VAPID details
webpush.setVapidDetails(
  "mailto:you@example.com",
  publicKey,
  privateKey
);

// In-memory subscriptions array (use database for prod!)

// Handle receiving a new subscription from client
export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
    console.log("Received subscription", subscription);

    // Save the subscription (use DB in production)
    subscriptions.push(subscription);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Subscribe error:", e);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
