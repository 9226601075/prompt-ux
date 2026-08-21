export const INPUT_LANGUAGE_AUTO = "auto" as const;

export type LanguageId =
  | "english"
  | "hindi"
  | "hinglish"
  | "marathi"
  | "gujarati"
  | "bengali"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "punjabi"
  | "urdu";

export type LanguageSelection = LanguageId | typeof INPUT_LANGUAGE_AUTO;

export type LanguageDefinition = {
  id: LanguageId;
  name: string;
  nativeName: string;
  code: string;
  supportsEnglishStyles: boolean;
};

export const LANGUAGE_CONFIG: readonly LanguageDefinition[] = [
  { id: "english", name: "English", nativeName: "English", code: "en", supportsEnglishStyles: true },
  { id: "hindi", name: "Hindi", nativeName: "हिन्दी", code: "hi", supportsEnglishStyles: false },
  { id: "hinglish", name: "Hinglish", nativeName: "Hinglish", code: "hing", supportsEnglishStyles: false },
  { id: "marathi", name: "Marathi", nativeName: "मराठी", code: "mr", supportsEnglishStyles: false },
  { id: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી", code: "gu", supportsEnglishStyles: false },
  { id: "bengali", name: "Bengali", nativeName: "বাংলা", code: "bn", supportsEnglishStyles: false },
  { id: "tamil", name: "Tamil", nativeName: "தமிழ்", code: "ta", supportsEnglishStyles: false },
  { id: "telugu", name: "Telugu", nativeName: "తెలుగు", code: "te", supportsEnglishStyles: false },
  { id: "kannada", name: "Kannada", nativeName: "ಕನ್ನಡ", code: "kn", supportsEnglishStyles: false },
  { id: "malayalam", name: "Malayalam", nativeName: "മലയാളം", code: "ml", supportsEnglishStyles: false },
  { id: "punjabi", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", code: "pa", supportsEnglishStyles: false },
  { id: "urdu", name: "Urdu", nativeName: "اردو", code: "ur", supportsEnglishStyles: false },
];

export const ENGLISH_OUTPUT_STYLES = [
  { id: "professional", label: "Professional English" },
  { id: "simple", label: "Simple English" },
  { id: "technical", label: "Technical English" },
  { id: "creative", label: "Creative English" },
] as const;

export type EnglishOutputStyleId = (typeof ENGLISH_OUTPUT_STYLES)[number]["id"];

export function getLanguage(id: LanguageId): LanguageDefinition {
  return LANGUAGE_CONFIG.find((language) => language.id === id) ?? LANGUAGE_CONFIG[0];
}
