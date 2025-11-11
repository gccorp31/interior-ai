import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServer } from "@/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

type PackSpec = { priceId: string; credits: number; name: string };
const PACKS: Record<string, PackSpec> = {
  pack_50: { priceId: process.env.STRIPE_PRICE_10_EUR || "", credits: 50, name: "Pack Découverte" },
  pack_200: { priceId: process.env.STRIPE_PRICE_29_EUR || "", credits: 200, name: "Pack Pro" },
};

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packId } = await req.json();
    const spec = PACKS[packId as keyof typeof PACKS];
    if (!spec) {
      return NextResponse.json({ error: "Pack inconnu" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: user.id,
      line_items: [
        {
          price: spec.priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success`,
      cancel_url: `${siteUrl}/pricing?canceled=1`,
      metadata: {
        credit_amount: String(spec.credits),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erreur Stripe" }, { status: 500 });
  }
}


