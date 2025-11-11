import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: generations, error: generationsError } = await supabase
      .from("generations")
      .select("id, original_image_url, generated_image_url, style_key, room_type_key, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (generationsError) {
      return NextResponse.json({ error: "Erreur lors de la récupération des générations" }, { status: 500 });
    }

    return NextResponse.json({ generations: generations || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}


