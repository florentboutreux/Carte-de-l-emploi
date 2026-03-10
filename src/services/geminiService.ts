import { GoogleGenAI } from "@google/genai";
import { JobOffer, SearchParams } from "../types";

// Initialize AI lazily to avoid issues with missing API key on startup
let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    try {
      // The API key is injected by Vite's define plugin.
      // If it's empty on GitHub Pages, this might throw an error.
      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing. AI features will not work.");
        return null;
      }
      aiInstance = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
      return null;
    }
  }
  return aiInstance;
}

export async function searchJobs(params: SearchParams): Promise<JobOffer[]> {
  const { query, location, radius, lat, lng, filters, userAddress, expandToSimilar } = params;
  const ai = getAI();
  
  if (!ai) {
    console.warn("AI not initialized, returning mock jobs as fallback.");
    return getMockJobs(params);
  }
  
  const filterText = filters ? `
  Filtres additionnels :
  - Type de contrat : ${filters.contractType || 'Tous'}
  - Niveau d'expérience : ${filters.experienceLevel || 'Tous'}
  - Fourchette de salaire : ${filters.salaryRange[0]}€ - ${filters.salaryRange[1]}€
  - Secteur d'activité : ${filters.industry || 'Tous'}` : '';

  const travelPrompt = userAddress ? `
  L'utilisateur habite à l'adresse suivante : "${userAddress}". 
  Pour chaque offre, calcule la distance exacte en voiture et le temps de trajet estimé depuis cette adresse en utilisant Google Maps.` : '';

  const similarPrompt = expandToSimilar ? `
  IMPORTANT: L'utilisateur a demandé d'élargir la recherche aux métiers similaires ou aux métiers qui utilisent des compétences transférables.
  Inclus environ 50% d'offres correspondant exactement à "${query}" et 50% d'offres pour des métiers similaires ou connexes.
  Pour chaque offre, indique "isSimilarJob": true si c'est un métier connexe/similaire, ou false si c'est exactement le métier recherché.` : `
  Pour chaque offre, indique "isSimilarJob": false.`;

  const prompt = `Recherche des offres d'emploi pour "${query}" à "${location}" ou dans un rayon de ${radius}km.
  ${filterText}
  ${travelPrompt}
  ${similarPrompt}
  
   Pour chaque offre trouvée, donne-moi les informations suivantes au format JSON dans ton texte (je vais le parser) :
  - title: le titre du poste
  - company: le nom de l'entreprise
  - location: l'adresse ou la ville
  - description: un court résumé
  - lat: latitude (approximative si besoin)
  - lng: longitude (approximative si besoin)
  - url: un lien vers l'offre ou le site de l'entreprise
  - contractType: le type de contrat
  - experienceLevel: le niveau d'expérience
  - salary: le salaire indiqué
  - industry: le secteur
  - travelDistance: la distance en voiture depuis l'adresse de l'utilisateur (ex: "15 km")
  - travelTime: le temps de trajet estimé en voiture (ex: "20 min")
  - transitTime: le temps de trajet estimé en transports en commun (ex: "35 min")
  - transitSummary: un court résumé du trajet en transport (ex: "RER A puis Bus 114")
  - companyDescription: une description de l'entreprise
  - website: le site web de l'entreprise
  - rating: une note sur 5 (ex: 4.2)
  - isSimilarJob: booléen (true si c'est un métier connexe, false sinon)
  
  Utilise l'outil Google Maps pour valider les emplacements des entreprises, calculer les distances et vérifier les options de transport en commun.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined,
          }
        }
      },
    });

    const text = response.text;
    
    // Try to extract JSON from the text
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (jsonMatch) {
      try {
        const jobs = JSON.parse(jsonMatch[0]);
        return jobs.map((job: any, index: number) => ({
          ...job,
          id: job.id || `job-${index}`,
          lat: parseFloat(job.lat) || 0,
          lng: parseFloat(job.lng) || 0,
        }));
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
      }
    }

    // Fallback: parse grounding chunks if JSON extraction fails
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const jobs: JobOffer[] = [];
    
    groundingChunks.forEach((chunk: any, index: number) => {
      if (chunk.maps) {
        jobs.push({
          id: `job-grounded-${index}`,
          title: chunk.maps.title || "Offre d'emploi",
          company: "Entreprise locale",
          location: chunk.maps.title || location,
          description: "Consultez le lien pour plus de détails sur cette opportunité.",
          url: chunk.maps.uri,
          lat: lat || 48.8566, // Default to Paris or provided lat
          lng: lng || 2.3522,
        });
      }
    });

    return jobs;
  } catch (error: any) {
    console.error("Error searching jobs:", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED") {
      console.warn("Rate limit exceeded, falling back to mock jobs");
      return getMockJobs(params);
    }
    return [];
  }
}

export async function geocodeLocation(locationName: string): Promise<{ lat: number, lng: number } | null> {
  const ai = getAI();
  if (!ai) return null;
  
  const prompt = `Donne-moi les coordonnées GPS (latitude et longitude) pour le lieu suivant : "${locationName}". 
  Réponds uniquement au format JSON : {"lat": 0.0, "lng": 0.0}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export function getMockJobs(params: SearchParams): JobOffer[] {
  const { query, location, radius, lat, lng, expandToSimilar } = params;
  const mockJobs: JobOffer[] = [
    {
      id: "mock-1",
      title: query || "Développeur Fullstack React",
      company: "TechNova Solutions",
      location: location || "Paris",
      description: "Nous recherchons un développeur passionné par React et Node.js pour rejoindre notre équipe agile. Vous travaillerez sur des projets innovants à fort impact.",
      url: "https://example.com/jobs/1",
      lat: (lat || 48.8566) + 0.01,
      lng: (lng || 2.3522) + 0.01,
      contractType: "CDI",
      experienceLevel: "Senior",
      salary: "55k€ - 65k€",
      industry: "Tech",
      travelDistance: "5.2 km",
      travelTime: "12 min",
      transitTime: "25 min",
      transitSummary: "Métro 1 puis Bus 72",
      companyDescription: "TechNova est un leader dans le développement de solutions logicielles sur mesure pour les entreprises du CAC 40.",
      website: "https://technova.example.com",
      rating: 4.8,
      isSimilarJob: false
    },
    {
      id: "mock-2",
      title: expandToSimilar ? "Scrum Master / Agile Coach" : (query || "Chef de Projet Marketing Digital"),
      company: "Creative Pulse Agency",
      location: location || "Paris",
      description: "Rejoignez une agence créative en pleine croissance. Vous piloterez des campagnes multicanales pour des marques internationales prestigieuses.",
      url: "https://example.com/jobs/2",
      lat: (lat || 48.8566) - 0.01,
      lng: (lng || 2.3522) - 0.01,
      contractType: "CDD",
      experienceLevel: "Intermédiaire",
      salary: "40k€ - 45k€",
      industry: "Marketing",
      travelDistance: "8.1 km",
      travelTime: "18 min",
      transitTime: "30 min",
      transitSummary: "Ligne 14 puis 10 min de marche",
      companyDescription: "Creative Pulse est une agence de communication 360° spécialisée dans le luxe et la mode.",
      website: "https://creativepulse.example.com",
      rating: 4.2,
      isSimilarJob: expandToSimilar ? true : false
    },
    {
      id: "mock-3",
      title: expandToSimilar ? "Product Owner" : (query || "Analyste Data Science"),
      company: "DataInsight Corp",
      location: location || "Paris",
      description: "Exploitez la puissance de la donnée pour transformer le business. Vous concevrez des modèles prédictifs complexes pour optimiser les processus de nos clients.",
      url: "https://example.com/jobs/3",
      lat: (lat || 48.8566) + 0.015,
      lng: (lng || 2.3522) - 0.005,
      contractType: "CDI",
      experienceLevel: "Senior",
      salary: "60k€ - 75k€",
      industry: "Data",
      travelDistance: "12.5 km",
      travelTime: "25 min",
      transitTime: "45 min",
      transitSummary: "RER B puis Bus 197",
      companyDescription: "DataInsight aide les entreprises à prendre de meilleures décisions grâce à l'analyse avancée de données massives.",
      website: "https://datainsight.example.com",
      rating: 4.5,
      isSimilarJob: expandToSimilar ? true : false
    }
  ];
  return mockJobs;
}

export async function getAddressSuggestions(input: string): Promise<string[]> {
  if (input.length < 3) return [];
  const ai = getAI();
  if (!ai) return [];
  
  const prompt = `Donne-moi 5 suggestions d'adresses postales réelles en France commençant par ou correspondant à : "${input}". 
  Réponds uniquement au format JSON : ["adresse 1", "adresse 2", ...]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Suggestions error:", error);
    return [];
  }
}
