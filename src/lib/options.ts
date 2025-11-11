export const ROOM_TYPES_FR = [
  { key: "living_room", label: "Salon" },
  { key: "bedroom", label: "Chambre" },
  { key: "kitchen", label: "Cuisine" },
  { key: "bathroom", label: "Salle de bain" },
  { key: "dining_room", label: "Salle à manger" },
  { key: "office", label: "Bureau" },
];

export const STYLES_FR = [
  { key: "scandinavian", label: "Scandinave" },
  { key: "industrial", label: "Industriel" },
  { key: "japandi", label: "Japandi" },
  { key: "minimalist", label: "Minimaliste" },
  { key: "bohemian", label: "Bohème" },
  { key: "modern", label: "Moderne" },
  { key: "mediterranean", label: "Méditerranéen" },
];

// Mapping FR (labels) -> EN (prompts). Les keys sont déjà en EN utilisables dans le prompt.
export const STYLE_PROMPT_EN: Record<string, string> = {
  scandinavian: "Scandinavian",
  industrial: "Industrial",
  japandi: "Japandi",
  minimalist: "Minimalist",
  bohemian: "Bohemian",
  modern: "Modern",
  mediterranean: "Mediterranean",
};

export const ROOM_PROMPT_EN: Record<string, string> = {
  living_room: "Living Room",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  dining_room: "Dining Room",
  office: "Home Office",
};



