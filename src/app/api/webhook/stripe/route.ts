import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "edge";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-10-29.clover",
  });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: true }, { status: 400 });

  const buf = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return NextResponse.json({ ok: true }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const creditStr = (session.metadata as any)?.credit_amount || "0";
    const creditAmount = Number(creditStr) || 0;

    if (userId && creditAmount > 0) {
      // Créditer l'utilisateur de façon atomique
      try {
        await supabaseAdmin.rpc("increment_user_credits", {
          p_user_id: userId,
          p_amount: creditAmount,
        });
      } catch (rpcError) {
        // fallback si RPC non créé: faire un update simple
        const { data: profile } = await supabaseAdmin
          .from("user_profiles")
          .select("credit_balance")
          .eq("id", userId)
          .single();
        if (profile) {
          await supabaseAdmin
            .from("user_profiles")
            .update({ credit_balance: profile.credit_balance + creditAmount })
            .eq("id", userId);
        }
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}



