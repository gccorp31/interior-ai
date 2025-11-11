import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const status = payload?.status as string | undefined;
    const output = payload?.output;
    const metadata = payload?.metadata || {};

    if (!status || !metadata?.user_id || !metadata?.original_image_url) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (status !== "succeeded") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const generatedUrl = Array.isArray(output) ? output[0] : output;
    if (!generatedUrl) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const supabase = await getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Récupérer la dernière génération correspondante pour cet utilisateur et cette image
    const { data: genRow } = await supabase
      .from("generations")
      .select("id")
      .eq("user_id", metadata.user_id)
      .eq("original_image_url", metadata.original_image_url)
      .is("generated_image_url", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!genRow?.id) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await supabase
      .from("generations")
      .update({ generated_image_url: generatedUrl })
      .eq("id", genRow.id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}



