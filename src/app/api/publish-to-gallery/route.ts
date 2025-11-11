import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { generationId } = await req.json();
    if (!generationId) {
      return NextResponse.json({ error: "generationId est requis" }, { status: 400 });
    }

    // Vérifier que la génération appartient à l'utilisateur (utiliser supabaseAdmin pour contourner RLS)
    const { data: generation, error: generationError } = await supabaseAdmin
      .from("generations")
      .select("id, user_id, generated_image_url")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .single();

    if (generationError || !generation) {
      return NextResponse.json({ error: "Génération introuvable" }, { status: 404 });
    }

    if (!generation.generated_image_url) {
      return NextResponse.json({ error: "La génération n'est pas encore terminée" }, { status: 400 });
    }

    // Mettre à jour la génération pour la rendre publique (utiliser supabaseAdmin pour contourner RLS)
    const { error: updateError } = await supabaseAdmin
      .from("generations")
      .update({ is_public: true, published_to_gallery: true })
      .eq("id", generationId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Erreur lors de la publication:", updateError);
      return NextResponse.json({ error: "Erreur lors de la publication" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur dans /api/publish-to-gallery:", error);
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}

