import axios from "axios";

const REPLICATE_API_BASE = "https://api.replicate.com/v1";

export type CreatePredictionResponse = {
  id: string;
  status: string;
};

// Mode mock pour les tests E2E (évite d'utiliser de vrais crédits Replicate)
// Fonction pour déterminer si on est en mode mock (appelée à l'exécution, pas au chargement du module)
function getIsMockMode(): boolean {
  try {
    return (
      process.env.REPLICATE_MOCK_MODE === "true" || 
      process.env.NODE_ENV === "test" ||
      (process.env.NODE_ENV === "development" && !process.env.REPLICATE_API_TOKEN)
    );
  } catch (e) {
    // En cas d'erreur, désactiver le mode mock
    return false;
  }
}

// Stockage en mémoire des prédictions mock (pour simuler le polling)
const mockPredictions = new Map<string, { createdAt: number; status: string; output?: string }>();

/**
 * Simule une prédiction Replicate en mode mock
 */
function createMockPrediction(): CreatePredictionResponse {
  // Générer un ID de prédiction aléatoire
  const predictionId = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  // Initialiser la prédiction en "starting"
  const predictionData = {
    createdAt: Date.now(),
    status: "starting" as const,
  };
  
  mockPredictions.set(predictionId, predictionData);
  
  console.log(`[REPLICATE MOCK] ✅ Prédiction mock créée: ${predictionId}`);
  console.log(`[REPLICATE MOCK] Nombre de prédictions dans la Map: ${mockPredictions.size}`);
  
  return {
    id: predictionId,
    status: "starting", // La prédiction démarre, elle sera "succeeded" après le polling
  };
}

export async function createPrediction(params: {
  model: string;
  input: Record<string, any>;
  webhook?: string;
  metadata?: Record<string, any>;
}): Promise<CreatePredictionResponse> {
  // Vérifier le mode mock à l'exécution
  const isMockMode = getIsMockMode();
  
  // Mode mock pour les tests
  if (isMockMode) {
    const prediction = createMockPrediction();
    return prediction;
  }

  // En mode production, vérifier que le token est configuré
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN n'est pas configuré et le mode mock n'est pas activé");
  }

  try {
    // Construire le body de la requête
    // Replicate API v1 utilise "model" pour le nom du modèle (ex: "stability-ai/sdxl")
    // ou "version" pour un hash de version spécifique
    const requestBody: Record<string, any> = {
      input: params.input,
    };
    
    // Détecter si c'est un hash de version (contient ":") ou un nom de modèle simple
   // Si ça contient ":", c'est un hash de version -> utiliser "version"
   // Sinon, si ça contient "/", c'est un nom de modèle -> utiliser "model"
   // Sinon, c'est probablement un hash de version -> utiliser "version"
   if (params.model.includes(':')) {
     // Hash de version (format: "model:hash")
     requestBody.version = params.model;
   } else if (params.model.includes('/')) {
     // Nom de modèle simple (format: "owner/model")
     requestBody.model = params.model;
   } else {
     // Hash de version seul (format long sans ":")
     requestBody.version = params.model;
   }
    
    // Ajouter webhook uniquement s'il est défini et valide (HTTPS)
    if (params.webhook && params.webhook.startsWith('https://')) {
      requestBody.webhook = params.webhook;
    }
    
    // Ne pas inclure metadata (le modèle ne l'accepte pas)
    
    const res = await axios.post<CreatePredictionResponse>(
      `${REPLICATE_API_BASE}/predictions`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    // Gérer les erreurs axios de manière plus explicite
    if (error.response) {
      // L'API a répondu avec un code d'erreur
      throw new Error(`Erreur Replicate API: ${error.response.status} - ${error.response.data?.detail || error.response.data?.error || 'Erreur inconnue'}`);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      throw new Error("Aucune réponse de l'API Replicate. Vérifiez votre connexion réseau.");
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      throw new Error(`Erreur lors de la configuration de la requête Replicate: ${error.message}`);
    }
  }
}

export async function getPrediction(predictionId: string): Promise<{
  id: string;
  status: string;
  output?: string | string[] | null;
  error?: string | null;
}> {
  // Vérifier le mode mock à l'exécution
  const isMockMode = getIsMockMode();
  
  console.log(`[REPLICATE] getPrediction appelé: predictionId=${predictionId}, isMockMode=${isMockMode}`);
  
  // Mode mock pour les tests
  if (isMockMode) {
    // Si c'est une prédiction mock, simuler le processus
    if (predictionId.startsWith('mock-')) {
      console.log(`[REPLICATE MOCK] Recherche de la prédiction ${predictionId} dans mockPredictions...`);
      const prediction = mockPredictions.get(predictionId);
      
      if (!prediction) {
        // Prédiction non trouvée - cela ne devrait pas arriver si createMockPrediction a été appelé
        console.error(`[REPLICATE MOCK] ⚠️ Prédiction ${predictionId} non trouvée dans mockPredictions!`);
        console.log(`[REPLICATE MOCK] Prédictions disponibles:`, Array.from(mockPredictions.keys()));
        // Créer une prédiction par défaut pour éviter l'erreur
        const mockImageUrl = "https://via.placeholder.com/1024x1024/4F46E5/FFFFFF?text=Generated+Image";
        return {
          id: predictionId,
          status: "succeeded",
          output: mockImageUrl,
          error: null,
        };
      }
      
      // Simuler un délai de traitement (2 secondes)
      const elapsed = Date.now() - prediction.createdAt;
      const processingDelay = 2000; // 2 secondes
      
      console.log(`[REPLICATE MOCK] Prédiction ${predictionId}: elapsed=${elapsed}ms, delay=${processingDelay}ms, status=${prediction.status}`);
      
      if (elapsed < processingDelay) {
        // La prédiction est encore en cours
        console.log(`[REPLICATE MOCK] Prédiction ${predictionId} en cours de traitement...`);
        return {
          id: predictionId,
          status: "processing",
          output: null,
          error: null,
        };
      } else {
        // La prédiction est terminée
        if (prediction.status === "starting" || prediction.status === "processing") {
          // Marquer comme terminée
          const mockImageUrl = "https://via.placeholder.com/1024x1024/4F46E5/FFFFFF?text=Generated+Image";
          mockPredictions.set(predictionId, {
            ...prediction,
            status: "succeeded",
            output: mockImageUrl,
          });
          console.log(`[REPLICATE MOCK] ✅ Prédiction ${predictionId} marquée comme terminée avec output: ${mockImageUrl}`);
        }
        
        const updated = mockPredictions.get(predictionId)!;
        console.log(`[REPLICATE MOCK] Retour de la prédiction ${predictionId}: status=${updated.status}, hasOutput=${!!updated.output}`);
        return {
          id: predictionId,
          status: updated.status,
          output: updated.output || null,
          error: null,
        };
      }
    } else {
      // Si ce n'est pas une prédiction mock mais qu'on est en mode mock, créer une réponse par défaut
      console.warn(`[REPLICATE MOCK] ⚠️ Prédiction ${predictionId} ne commence pas par "mock-", mais on est en mode mock. Création d'une réponse par défaut.`);
      const mockImageUrl = "https://via.placeholder.com/1024x1024/4F46E5/FFFFFF?text=Generated+Image";
      return {
        id: predictionId,
        status: "succeeded",
        output: mockImageUrl,
        error: null,
      };
    }
  }

  // En mode production, vérifier que le token est configuré
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN n'est pas configuré");
  }

  const res = await axios.get(`${REPLICATE_API_BASE}/predictions/${predictionId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      },
    }
  );
  return res.data;
}


