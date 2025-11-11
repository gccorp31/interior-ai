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

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("credit_balance")
      .eq("id", user.id)
      .single();

    if (profileError) {
      // Si le profil n'existe pas, retourner 0 crédits
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ credits: 0 });
      }
      return NextResponse.json({ error: "Erreur lors de la récupération des crédits" }, { status: 500 });
    }

    return NextResponse.json({ credits: profile?.credit_balance || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}


