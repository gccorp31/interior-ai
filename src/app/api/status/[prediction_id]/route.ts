import { NextResponse } from "next/server";
import { getPrediction } from "@/lib/replicate";

type Params = {
  params: Promise<{ prediction_id: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  console.log("[API STATUS] ========== DÉBUT /api/status ==========");
  try {
    // Dans Next.js 15+, params est une Promise et doit être await
    let predictionId: string;
    try {
      const { prediction_id } = await params;
      predictionId = prediction_id;
      console.log("[API STATUS] prediction_id reçu:", predictionId);
    } catch (paramsError: any) {
      console.error("[API STATUS] Erreur lors de la récupération des params:", {
        error: paramsError,
        message: paramsError?.message
      });
      return NextResponse.json({ error: "Erreur lors de la récupération des paramètres" }, { status: 400 });
    }
    
    if (!predictionId) {
      console.error("[API STATUS] prediction_id manquant");
      return NextResponse.json({ error: "prediction_id manquant" }, { status: 400 });
    }
    
    console.log("[API STATUS] Appel à getPrediction...");
    let data;
    try {
      data = await getPrediction(predictionId);
      console.log("[API STATUS] Résultat de getPrediction:", {
        id: data?.id,
        status: data?.status,
        hasOutput: !!data?.output,
        hasError: !!data?.error
      });
    } catch (predictionError: any) {
      console.error("[API STATUS] Erreur lors de l'appel à getPrediction:", {
        error: predictionError,
        message: predictionError?.message,
        stack: predictionError?.stack
      });
      return NextResponse.json({ 
        error: predictionError?.message ?? "Erreur lors de la récupération de la prédiction",
        status: "failed"
      }, { status: 500 });
    }
    
    console.log("[API STATUS] ========== SUCCÈS /api/status ==========");
    return NextResponse.json({
      id: data.id,
      status: data.status,
      output: data.output ?? null,
      error: data.error ?? null,
    });
  } catch (e: any) {
    console.error("[API STATUS] ========== ERREUR FATALE /api/status ==========");
    console.error("[API STATUS] Exception non gérée:", {
      error: e,
      message: e?.message,
      stack: e?.stack,
      name: e?.name
    });
    return NextResponse.json({ 
      error: e?.message ?? "Erreur serveur",
      status: "failed"
    }, { status: 500 });
  }
}



