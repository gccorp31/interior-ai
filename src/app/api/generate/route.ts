import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { STYLE_PROMPT_EN, ROOM_PROMPT_EN } from "@/lib/options";
import { createPrediction } from "@/lib/replicate";

export async function POST(req: Request) {
  console.log("[API] ========== DÉBUT /api/generate ==========");
  try {
    // Parser le body en premier pour éviter les problèmes
    let body: any;
    try {
      body = await req.json();
      console.log("[API] Body parsé avec succès:", { 
        hasImageUrl: !!body?.imageUrl, 
        styleKey: body?.styleKey,
        roomTypeKey: body?.roomTypeKey,
        anonymousGenerationCount: body?.anonymousGenerationCount 
      });
    } catch (parseError: any) {
      console.error("[API] Erreur lors du parsing du body:", parseError);
      return NextResponse.json({ 
        error: "Requête invalide: le body JSON ne peut pas être parsé",
        details: process.env.NODE_ENV === "development" ? parseError?.message : undefined
      }, { status: 400 });
    }

    const imageUrl: string = body?.imageUrl;
    const styleKey: string = body?.styleKey;
    const roomTypeKey: string = body?.roomTypeKey;
    const anonymousGenerationCount: number = body?.anonymousGenerationCount ?? 0;
    const userIdFromClient: string | undefined = body?.userId; // userId fourni par le client si authentifié

    if (!imageUrl) {
      console.error("[API] imageUrl manquant dans le body");
      return NextResponse.json({ error: "imageUrl est requis" }, { status: 400 });
    }

    // Vérifier la configuration de supabaseAdmin
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log("[API] Configuration Supabase:", { 
      hasSupabaseUrl, 
      hasServiceRoleKey,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    });

    // Initialiser Supabase de manière sécurisée
    let user: any = null;
    let userError: any = null;
    let isAnonymous = true;
    let supabase: any = null;

    try {
      console.log("[API] Tentative d'initialisation de Supabase...");
      supabase = await getSupabaseServer();
      console.log("[API] getSupabaseServer() retourné:", !!supabase);
      
      if (supabase) {
        console.log("[API] Récupération de l'utilisateur...");
        const authResult = await supabase.auth.getUser();
        user = authResult?.data?.user ?? null;
        userError = authResult?.error ?? null;
        isAnonymous = !user || !!userError;
        console.log("[API] État d'authentification:", { 
          hasUser: !!user, 
          userId: user?.id,
          hasError: !!userError,
          isAnonymous,
          errorMessage: userError?.message,
          errorCode: userError?.code,
          errorStatus: userError?.status
        });
        
        // Si l'utilisateur n'est pas détecté, vérifier les cookies
        if (!user && !userError) {
          console.log("[API] ⚠️ Aucun utilisateur détecté et aucune erreur - problème de cookies ?");
        } else if (userError) {
          console.log("[API] ⚠️ Erreur lors de la récupération de l'utilisateur:", {
            code: userError.code,
            message: userError.message,
            status: userError.status
          });
        }
        
        // FALLBACK: Si l'utilisateur n'est pas détecté via les cookies mais qu'un userId est fourni par le client,
        // considérer l'utilisateur comme authentifié (les cookies peuvent ne pas être transmis correctement)
        if (!user && userIdFromClient) {
          console.log("[API] ⚠️ Utilisateur non détecté via cookies, mais userId fourni par le client:", userIdFromClient);
          console.log("[API] ⚠️ Utilisation du userId du client comme fallback (problème de transmission des cookies)");
          // Créer un objet user minimal avec l'ID fourni par le client
          user = { id: userIdFromClient };
          isAnonymous = false;
          console.log("[API] ✅ Mode authentifié activé via fallback userId");
        }
      } else {
        // Si Supabase n'est pas disponible, considérer comme anonyme
        console.log("[API] Supabase non disponible, mode anonyme");
        isAnonymous = true;
      }
    } catch (supabaseError: any) {
      // Si Supabase échoue, considérer comme utilisateur anonyme
      console.error("[API] Erreur lors de l'initialisation de Supabase:", {
        message: supabaseError?.message,
        stack: supabaseError?.stack,
        name: supabaseError?.name
      });
      isAnonymous = true;
    }

    // Pour les utilisateurs anonymes, vérifier la limite (2 générations)
    if (isAnonymous) {
      console.log("[API] ⚠️ MODE ANONYME DÉTECTÉ - Vérification de la limite:", { anonymousGenerationCount });
      console.log("[API] ⚠️ Raison du mode anonyme:", { 
        hasUser: !!user, 
        hasUserError: !!userError, 
        userError: userError?.message,
        hasSupabase: !!supabase
      });
      if (anonymousGenerationCount >= 2) {
        console.log("[API] Limite de générations anonymes atteinte");
        return NextResponse.json({ error: "Limite de générations gratuites atteinte. Créez un compte pour continuer." }, { status: 403 });
      }
      console.log("[API] Génération anonyme autorisée");
      // Pas de vérification de crédits pour les utilisateurs anonymes
    } else {
      // Pour les utilisateurs authentifiés, vérifier que user existe et que supabase est disponible
      console.log("[API] ✅ MODE AUTHENTIFIÉ DÉTECTÉ - Vérification des crédits");
      console.log("[API] ✅ Détails de l'utilisateur authentifié:", { 
        userId: user?.id, 
        userEmail: user?.email,
        hasSupabase: !!supabase 
      });
      if (!user || !supabase) {
        console.error("[API] Utilisateur ou Supabase manquant:", { hasUser: !!user, hasSupabase: !!supabase });
        return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
      }
      
      try {
        console.log(`[API] Récupération du profil pour l'utilisateur ${user.id}...`);
        
        // Vérifier que supabaseAdmin est configuré
        if (!hasServiceRoleKey) {
          console.error("[API] ⚠️ SUPABASE_SERVICE_ROLE_KEY non défini!");
          console.error("[API] ⚠️ Les crédits ne peuvent pas être décrémentés sans la clé de service!");
          // En mode développement/test, on peut continuer, mais cela signifie que les crédits ne seront pas décrémentés
          // C'est un problème qui doit être résolu en production
          console.warn("[API] ⚠️ Continuation sans décrémentation (mode test?) - ATTENTION: Les crédits ne seront PAS décrémentés!");
          // NE PAS continuer si la clé n'est pas définie - cela signifie que l'UPDATE ne fonctionnera pas
          // Mais on peut quand même continuer la génération pour les tests
        } else {
          console.log("[API] ✅ SUPABASE_SERVICE_ROLE_KEY est défini, la décrémentation peut être effectuée");
        }
        
        // TOUJOURS essayer de décrémenter si on a un utilisateur authentifié
        // Vérifier d'abord que supabaseAdmin fonctionne
        console.log("[API] Vérification de supabaseAdmin...");
        try {
          // Test simple pour vérifier que supabaseAdmin fonctionne
          const testQuery = await supabaseAdmin.from("user_profiles").select("id").limit(1);
          console.log("[API] Test de supabaseAdmin:", { hasError: !!testQuery.error, error: testQuery.error?.message });
        } catch (testErr: any) {
          console.error("[API] ❌ Erreur lors du test de supabaseAdmin:", testErr);
        }
        
        // Vérifier les crédits (utiliser supabaseAdmin pour contourner les RLS)
        console.log(`[API] Récupération du profil pour l'utilisateur ${user.id}...`);
        let { data: profile, error: profErr } = await supabaseAdmin
          .from("user_profiles")
          .select("id, credit_balance")
          .eq("id", user.id)
          .single();
        
        console.log(`[API] Résultat de la récupération du profil:`, {
          hasProfile: !!profile,
          creditBalance: profile?.credit_balance,
          hasError: !!profErr,
          errorCode: profErr?.code,
          errorMessage: profErr?.message
        });
        
        // Si le profil n'existe pas, le créer avec 5 crédits (plan Découverte)
        if (profErr && (profErr.code === 'PGRST116' || profErr.message?.includes('0 rows') || profErr.message?.includes('No rows'))) {
          console.log(`[API] Profil inexistant, création avec 5 crédits...`);
          const { data: newProfile, error: createErr } = await supabaseAdmin
            .from("user_profiles")
            .insert({
              id: user.id,
              credit_balance: 5,
            })
            .select("id, credit_balance")
            .single();
          
          if (createErr || !newProfile) {
            console.error("[API] Erreur lors de la création du profil:", {
              error: createErr,
              hasNewProfile: !!newProfile,
              errorCode: createErr?.code,
              errorMessage: createErr?.message,
              errorDetails: createErr?.details,
              errorHint: createErr?.hint
            });
            return NextResponse.json({ error: "Impossible de créer le profil utilisateur" }, { status: 500 });
          }
          profile = newProfile;
          console.log(`[API] ✅ Profil créé pour l'utilisateur ${user.id} avec ${profile.credit_balance} crédits`);
          console.log(`[API] Détails du profil créé:`, {
            id: newProfile.id,
            credit_balance: newProfile.credit_balance
          });
          
          // Vérifier que le profil est bien créé en le relisant
          // Attendre un peu pour que la DB soit à jour
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: verifyProfile, error: verifyErr } = await supabaseAdmin
            .from("user_profiles")
            .select("id, credit_balance")
            .eq("id", user.id)
            .single();
          
          if (verifyErr || !verifyProfile) {
            console.error("[API] ⚠️ Le profil créé n'a pas pu être vérifié:", {
              error: verifyErr,
              hasProfile: !!verifyProfile,
              errorCode: verifyErr?.code,
              errorMessage: verifyErr?.message,
              errorDetails: verifyErr?.details,
              errorHint: verifyErr?.hint
            });
            // Si la vérification échoue, retourner une erreur pour que le client sache qu'il y a un problème
            return NextResponse.json({ 
              error: "Le profil a été créé mais n'a pas pu être vérifié",
              details: process.env.NODE_ENV === "development" ? verifyErr?.message : undefined
            }, { status: 500 });
          } else {
            console.log(`[API] ✅ Vérification du profil créé réussie:`, {
              id: verifyProfile.id,
              credit_balance: verifyProfile.credit_balance
            });
          }
        } else if (profErr) {
          console.error("[API] Erreur lors de la récupération du profil:", {
            error: profErr,
            errorCode: profErr?.code,
            errorMessage: profErr?.message
          });
          return NextResponse.json({ error: "Profil introuvable" }, { status: 400 });
        }
        
        if (!profile || profile.credit_balance <= 0) {
          console.log(`[API] Crédits épuisés:`, { profile: profile?.credit_balance });
          return NextResponse.json({ error: "Credits épuisés" }, { status: 402 });
        }

        const current = profile.credit_balance;
        console.log(`[API] AVANT décrémentation - Utilisateur: ${user.id}, Crédits actuels: ${current}`);
        
        // Utiliser supabaseAdmin pour la décrémentation (contourne les RLS)
        const newBalance = current - 1;
        console.log(`[API] Tentative de décrémentation: ${current} -> ${newBalance}`);
        
        try {
          // Méthode directe et fiable: utiliser UPDATE avec supabaseAdmin
          // Cela garantit que la décrémentation fonctionne même si les RLS posent problème
          console.log(`[API] Décrémentation des crédits: user.id=${user.id}, current=${current}, newBalance=${newBalance}`);
          
          // Utiliser UPDATE directement (plus fiable que UPSERT)
          console.log(`[API] Exécution de l'UPDATE: UPDATE user_profiles SET credit_balance = ${newBalance} WHERE id = '${user.id}'`);
          console.log(`[API] Service Role Key présent: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}, longueur: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0}`);
          
          const updateResponse = await supabaseAdmin
            .from("user_profiles")
            .update({ credit_balance: newBalance })
            .eq("id", user.id)
            .select("credit_balance");
          
          const updateResult = updateResponse.data;
          const updateErr = updateResponse.error;
          
          console.log("[API] Résultat de l'UPDATE:", {
            hasData: !!updateResult,
            dataLength: updateResult?.length || 0,
            data: updateResult,
            hasError: !!updateErr,
            errorCode: updateErr?.code,
            errorMessage: updateErr?.message,
            errorDetails: updateErr?.details,
            errorHint: updateErr?.hint
          });
          
          if (updateErr) {
            console.error("[API] ❌ Erreur lors de l'UPDATE:", {
              error: updateErr,
              errorCode: updateErr?.code,
              errorMessage: updateErr?.message,
              errorDetails: updateErr?.details,
              errorHint: updateErr?.hint
            });
            
            // Si UPDATE échoue, essayer UPSERT comme fallback
            console.log("[API] Tentative de fallback UPSERT...");
            const { data: upsertResult, error: upsertErr } = await supabaseAdmin
              .from("user_profiles")
              .upsert({
                id: user.id,
                credit_balance: newBalance,
              }, {
                onConflict: 'id'
              })
              .select("credit_balance")
              .single();
            
            if (upsertErr || !upsertResult) {
              console.error("[API] ❌ Erreur lors de l'UPSERT (fallback):", upsertErr);
              return NextResponse.json({ 
                error: "Impossible de décrémenter les crédits",
                details: process.env.NODE_ENV === "development" ? (upsertErr?.message || updateErr?.message) : undefined
              }, { status: 500 });
            }
            
            console.log(`[API] ✅ Crédits décrémentés via UPSERT (fallback): ${upsertResult.credit_balance}`);
          } else if (!updateResult || updateResult.length === 0) {
            console.error("[API] ❌ UPDATE n'a retourné aucun résultat (0 lignes mises à jour)");
            // Cela peut arriver si le profil n'existe pas, mais on l'a créé avant, donc c'est étrange
            // Essayer UPSERT comme fallback
            console.log("[API] Tentative de fallback UPSERT (aucun résultat UPDATE)...");
            const { data: upsertResult, error: upsertErr } = await supabaseAdmin
              .from("user_profiles")
              .upsert({
                id: user.id,
                credit_balance: newBalance,
              }, {
                onConflict: 'id'
              })
              .select("credit_balance")
              .single();
            
            if (upsertErr || !upsertResult) {
              console.error("[API] ❌ Erreur lors de l'UPSERT (fallback, aucun résultat UPDATE):", upsertErr);
              return NextResponse.json({ 
                error: "Impossible de décrémenter les crédits",
                details: process.env.NODE_ENV === "development" ? (upsertErr?.message || "Aucune ligne mise à jour") : undefined
              }, { status: 500 });
            }
            
            console.log(`[API] ✅ Crédits décrémentés via UPSERT (fallback, aucun résultat UPDATE): ${upsertResult.credit_balance}`);
          } else {
            const updatedBalance = updateResult[0]?.credit_balance;
            console.log(`[API] ✅ Crédits décrémentés via UPDATE: ${updatedBalance} (${updateResult.length} ligne(s) mise(s) à jour)`);
          }
          
          // Vérification finale avec plusieurs tentatives pour s'assurer que la DB est à jour
          let verifyFinal: any = null;
          let verifyFinalErr: any = null;
          for (let retry = 0; retry < 3; retry++) {
            await new Promise(resolve => setTimeout(resolve, 100 * (retry + 1))); // Petit délai entre les tentatives
            const verifyResult = await supabaseAdmin
              .from("user_profiles")
              .select("credit_balance")
              .eq("id", user.id)
              .single();
            verifyFinal = verifyResult.data;
            verifyFinalErr = verifyResult.error;
            if (!verifyFinalErr && verifyFinal && verifyFinal.credit_balance === newBalance) {
              console.log(`[API] ✅ Vérification finale réussie (tentative ${retry + 1}/3): crédits = ${verifyFinal.credit_balance}`);
              break; // La vérification est réussie
            }
          }
          
          if (verifyFinalErr) {
            console.error(`[API] ⚠️ Impossible de vérifier les crédits finaux après 3 tentatives:`, verifyFinalErr);
            // Si la vérification échoue, retourner une erreur pour que le client sache qu'il y a un problème
            return NextResponse.json({ 
              error: "Impossible de vérifier la décrémentation des crédits",
              details: process.env.NODE_ENV === "development" ? verifyFinalErr?.message : undefined
            }, { status: 500 });
          } else if (verifyFinal) {
            console.log(`[API] ✅ Vérification finale: crédits dans la DB = ${verifyFinal.credit_balance}`);
            if (verifyFinal.credit_balance !== newBalance) {
              console.error(`[API] ❌ INCOHÉRENCE: Les crédits dans la DB (${verifyFinal.credit_balance}) ne correspondent pas au nouveau solde attendu (${newBalance})`);
              // Si les crédits ne correspondent pas, retourner une erreur
              return NextResponse.json({ 
                error: "Incohérence détectée lors de la décrémentation des crédits",
                details: process.env.NODE_ENV === "development" ? `Attendu: ${newBalance}, Reçu: ${verifyFinal.credit_balance}` : undefined
              }, { status: 500 });
            }
          } else {
            console.error(`[API] ⚠️ Vérification finale: aucun résultat après 3 tentatives`);
            // Si aucun résultat après 3 tentatives, retourner une erreur
            return NextResponse.json({ 
              error: "Impossible de vérifier la décrémentation des crédits après plusieurs tentatives",
              details: process.env.NODE_ENV === "development" ? "Aucun résultat retourné par la vérification" : undefined
            }, { status: 500 });
          }
        } catch (updateError: any) {
          console.error("[API] Exception lors de la décrémentation:", {
            error: updateError,
            message: updateError?.message,
            stack: updateError?.stack,
            name: updateError?.name
          });
          return NextResponse.json({ 
            error: "Erreur lors de la décrémentation des crédits",
            details: process.env.NODE_ENV === "development" ? updateError?.message : undefined
          }, { status: 500 });
        }
      } catch (dbError: any) {
        console.error("[API] Exception dans le bloc de vérification des crédits:", {
          error: dbError,
          message: dbError?.message,
          stack: dbError?.stack,
          name: dbError?.name
        });
        // Échouer la requête si la vérification des crédits échoue
        // La décrémentation est critique et ne doit pas être ignorée
        return NextResponse.json({ 
          error: "Erreur lors de la vérification des crédits",
          details: process.env.NODE_ENV === "development" ? dbError?.message : undefined
        }, { status: 500 });
      }
    }

    console.log("[API] Préparation du prompt...");
    const styleEn = STYLE_PROMPT_EN[styleKey] ?? styleKey;
    const roomEn = ROOM_PROMPT_EN[roomTypeKey] ?? roomTypeKey;
    const positivePrompt = `A stunning high-end photorealistic rendering of a ${roomEn} in ${styleEn} style, ultra-detailed, natural light, interior design magazine quality`;
    const negativePrompt = "blurry, ugly, deformed, cartoon, low-resolution, text, watermark, logo";
    console.log("[API] Prompt préparé:", { styleEn, roomEn, promptLength: positivePrompt.length });

    // Vérifier si on est en mode mock (pour les tests)
    // Le mode mock est géré dans lib/replicate.ts, mais on vérifie ici aussi pour éviter les erreurs
    const isMockMode = 
      process.env.REPLICATE_MOCK_MODE === "true" || 
      process.env.NODE_ENV === "test" ||
      (process.env.NODE_ENV === "development" && !process.env.REPLICATE_API_TOKEN);
    
    console.log("[API] Mode Replicate:", { 
      isMockMode, 
      REPLICATE_MOCK_MODE: process.env.REPLICATE_MOCK_MODE,
      NODE_ENV: process.env.NODE_ENV,
      hasReplicateToken: !!process.env.REPLICATE_API_TOKEN
    });
    
    // Vérifier que le token Replicate est configuré (sauf en mode mock)
    if (!isMockMode && !process.env.REPLICATE_API_TOKEN) {
      console.error("[API] REPLICATE_API_TOKEN manquant et mode mock désactivé");
      return NextResponse.json({ 
        error: "Configuration serveur incomplète. Le service de génération n'est pas disponible." 
      }, { status: 503 });
    }

    // Version/identifiant du modèle Replicate (ex: un SDXL ControlNet Depth)
    const MODEL_VERSION = process.env.REPLICATE_MODEL_VERSION || "stability-ai/sdxl";

    // Webhook uniquement pour les utilisateurs authentifiés (les anonymes utilisent le polling)
    // De plus, le webhook doit être une URL HTTPS valide (pas localhost)
    let webhookUrl: string | undefined = undefined;
    if (!isAnonymous && process.env.NEXT_PUBLIC_SITE_URL) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      // Vérifier que l'URL est HTTPS (pas localhost en développement)
      if (siteUrl.startsWith('https://')) {
        webhookUrl = `${siteUrl}/api/webhook/replicate`;
      }
    }

    // Entrées par défaut SDXL Img2Img. Ajout optionnel ControlNet si configuré.
    const input: Record<string, any> = {
      image: imageUrl,
      prompt: positivePrompt,
      negative_prompt: negativePrompt,
      // Valeurs communes; certains modèles ignorent celles non supportées
      num_inference_steps: Number(process.env.REPLICATE_STEPS ?? 30),
      guidance_scale: Number(process.env.REPLICATE_GUIDANCE ?? 7.5),
      scheduler: process.env.REPLICATE_SCHEDULER ?? "DPMSolver++",
      seed: process.env.REPLICATE_SEED ? Number(process.env.REPLICATE_SEED) : undefined,
      strength: Number(process.env.REPLICATE_STRENGTH ?? 0.6), // pour img2img
    };

    if ((process.env.REPLICATE_CONTROLNET_ENABLE ?? "0") === "1") {
      input.control_type = process.env.REPLICATE_CONTROLNET_TYPE ?? "depth";
      // Beaucoup de modèles acceptent image comme contrôle; d'autres requièrent control_image séparé.
      input.control_image = imageUrl;
      input.controlnet_conditioning_scale = Number(process.env.REPLICATE_CONTROLNET_SCALE ?? 0.8);
    }

    console.log("[API] Appel à Replicate...");
    let prediction;
    try {
      // Appel à Replicate sans metadata (le modèle ne l'accepte pas)
      // Webhook uniquement pour les utilisateurs authentifiés avec une URL HTTPS valide
      console.log("[API] Paramètres de createPrediction:", {
        model: MODEL_VERSION,
        hasInput: !!input,
        hasWebhook: !!webhookUrl,
        webhookUrl
      });
      
      prediction = await createPrediction({
        model: MODEL_VERSION,
        input,
        webhook: webhookUrl,
      });
      
      console.log("[API] ✅ Prédiction Replicate créée:", {
        id: prediction?.id,
        status: prediction?.status
      });
    } catch (replicateErr: any) {
      console.error("[API] Erreur lors de l'appel à Replicate:", {
        error: replicateErr,
        message: replicateErr?.message,
        stack: replicateErr?.stack,
        name: replicateErr?.name
      });
      
      // Remboursement d'1 crédit en cas d'échec d'appel Replicate (uniquement pour utilisateurs authentifiés)
      if (!isAnonymous && user && hasServiceRoleKey) {
        try {
          console.log("[API] Tentative de remboursement du crédit...");
          const { data: profile } = await supabaseAdmin
            .from("user_profiles")
            .select("credit_balance")
            .eq("id", user.id)
            .single();
          if (profile) {
            await supabaseAdmin
              .from("user_profiles")
              .update({ credit_balance: profile.credit_balance + 1 })
              .eq("id", user.id);
            console.log("[API] ✅ Crédit remboursé");
          }
        } catch (refundErr: any) {
          // Log l'erreur de remboursement mais ne pas la propager
          console.error("[API] Erreur lors du remboursement:", {
            error: refundErr,
            message: refundErr?.message
          });
        }
      }
      // Propager l'erreur Replicate
      return NextResponse.json({ 
        error: replicateErr?.message || "Erreur lors de la génération avec Replicate" 
      }, { status: 500 });
    }

    // Enregistrer la génération uniquement pour les utilisateurs authentifiés
    if (!isAnonymous && user && hasServiceRoleKey) {
      try {
        console.log("[API] Enregistrement de la génération dans la base de données...");
        const { error: genErr } = await supabaseAdmin.from("generations").insert({
          user_id: user.id,
          original_image_url: imageUrl,
          generated_image_url: null,
          prompt: positivePrompt,
          style_key: styleKey,
          room_type_key: roomTypeKey,
          has_watermark: false, // Les utilisateurs authentifiés n'ont pas de watermark
        });
        if (genErr) {
          console.error("[API] Erreur lors de l'enregistrement de la génération:", {
            error: genErr,
            errorCode: genErr?.code,
            errorMessage: genErr?.message
          });
          // Ne pas échouer la requête si l'enregistrement échoue
        } else {
          console.log("[API] ✅ Génération enregistrée dans la base de données");
        }
      } catch (insertErr: any) {
        console.error("[API] Exception lors de l'enregistrement de la génération:", {
          error: insertErr,
          message: insertErr?.message,
          stack: insertErr?.stack
        });
        // Ne pas échouer la requête si l'enregistrement échoue
      }
    } else {
      console.log("[API] Génération non enregistrée:", { 
        isAnonymous, 
        hasUser: !!user, 
        hasServiceRoleKey 
      });
    }

    console.log("[API] ========== SUCCÈS /api/generate ==========");
    return NextResponse.json({ 
      predictionId: prediction.id, 
      status: prediction.status,
      isAnonymous: isAnonymous 
    });
  } catch (e: any) {
    // Logger l'erreur pour le débogage
    console.error("[API] ========== ERREUR FATALE /api/generate ==========");
    console.error("[API] Exception non gérée:", {
      error: e,
      message: e?.message,
      stack: e?.stack,
      name: e?.name,
      cause: e?.cause
    });
    return NextResponse.json({ 
      error: e?.message ?? "Erreur serveur",
      details: process.env.NODE_ENV === "development" ? e?.stack : undefined
    }, { status: 500 });
  }
}


