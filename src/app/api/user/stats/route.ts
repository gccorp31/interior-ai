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

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("credit_balance, plan")
      .eq("id", user.id)
      .single();

    // Récupérer le nombre de générations
    const { count: generationCount, error: generationCountError } = await supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 });
    }

    return NextResponse.json({
      credits: profile?.credit_balance || 0,
      plan: profile?.plan || "Découverte",
      generationCount: generationCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}


