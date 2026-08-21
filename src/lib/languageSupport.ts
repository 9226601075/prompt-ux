import {
  getLanguage,
  INPUT_LANGUAGE_AUTO,
  LANGUAGE_CONFIG,
  type LanguageId,
  type LanguageSelection,
} from "./languageConfig";

export type DetectedLanguage = {
  language: LanguageId;
  confidence: number;
  method: "selected" | "script" | "lexicon" | "fallback";
};

const scriptRanges: Array<{ language: LanguageId; pattern: RegExp }> = [
  { language: "hindi", pattern: /[\u0900-\u097f]/ },
  { language: "marathi", pattern: /[\u0900-\u097f]/ },
  { language: "gujarati", pattern: /[\u0a80-\u0aff]/ },
  { language: "bengali", pattern: /[\u0980-\u09ff]/ },
  { language: "tamil", pattern: /[\u0b80-\u0bff]/ },
  { language: "telugu", pattern: /[\u0c00-\u0c7f]/ },
  { language: "kannada", pattern: /[\u0c80-\u0cff]/ },
  { language: "malayalam", pattern: /[\u0d00-\u0d7f]/ },
  { language: "punjabi", pattern: /[\u0a00-\u0a7f]/ },
  { language: "urdu", pattern: /[\u0600-\u06ff]/ },
];

const lexicons: Array<{ language: LanguageId; words: RegExp }> = [
  { language: "hinglish", words: /\b(mere|mujhe|bana|banao|ke liye|ek|chahiye|kar do|sath|pe|aur|wala|wali)\b/i },
  { language: "english", words: /\b(the|create|make|write|generate|for|with|and|prompt|professional)\b/i },
];

export function detectInputLanguage(input: string, selection: LanguageSelection = INPUT_LANGUAGE_AUTO): DetectedLanguage {
  if (selection !== INPUT_LANGUAGE_AUTO) {
    return { language: selection, confidence: 1, method: "selected" };
  }

  const text = input.trim();
  for (const entry of scriptRanges) {
    if (entry.pattern.test(text)) {
      const language = entry.language === "hindi" && /[\u0900-\u097f]/.test(text)
        ? (/माझ|माझ्यासाठी|तयार/.test(text) ? "marathi" : "hindi")
        : entry.language;
      return { language, confidence: 0.9, method: "script" };
    }
  }

  for (const entry of lexicons) {
    if (entry.words.test(text)) {
      return { language: entry.language, confidence: entry.language === "hinglish" ? 0.82 : 0.78, method: "lexicon" };
    }
  }

  return { language: "english", confidence: 0.35, method: "fallback" };
}

const labels: Record<LanguageId, Record<string, string>> = {
  english: {},
  hindi: { Mode: "मोड", Role: "भूमिका", Objective: "उद्देश्य", Context: "संदर्भ", Requirements: "आवश्यकताएँ", Constraints: "सीमाएँ", "Output Format": "आउटपुट प्रारूप", "Output Structure": "आउटपुट संरचना", "Success Criteria": "सफलता के मानदंड", Task: "कार्य", Goal: "लक्ष्य", Output: "आउटपुट" },
  hinglish: { Mode: "Mode", Role: "Role", Objective: "Objective", Context: "Context", Requirements: "Requirements", Constraints: "Constraints", "Output Format": "Output Format", "Output Structure": "Output Structure", "Success Criteria": "Success Criteria", Task: "Task", Goal: "Goal", Output: "Output" },
  marathi: { Mode: "मोड", Role: "भूमिका", Objective: "उद्दिष्ट", Context: "संदर्भ", Requirements: "आवश्यकता", Constraints: "मर्यादा", "Output Format": "आउटपुट स्वरूप", "Output Structure": "आउटपुट रचना", "Success Criteria": "यशाचे निकष", Task: "कार्य", Goal: "ध्येय", Output: "आउटपुट" },
  gujarati: { Mode: "મોડ", Role: "ભૂમિકા", Objective: "ઉદ્દેશ્ય", Context: "સંદર્ભ", Requirements: "જરૂરિયાતો", Constraints: "મર્યાદાઓ", "Output Format": "આઉટપુટ ફોર્મેટ", "Success Criteria": "સફળતાના માપદંડ", Task: "કાર્ય", Goal: "લક્ષ્ય", Output: "આઉટપુટ" },
  bengali: { Mode: "মোড", Role: "ভূমিকা", Objective: "উদ্দেশ্য", Context: "প্রসঙ্গ", Requirements: "প্রয়োজনীয়তা", Constraints: "সীমাবদ্ধতা", "Output Format": "আউটপুট ফরম্যাট", "Success Criteria": "সাফল্যের মানদণ্ড", Task: "কাজ", Goal: "লক্ষ্য", Output: "আউটপুট" },
  tamil: { Mode: "முறை", Role: "பங்கு", Objective: "நோக்கம்", Context: "சூழல்", Requirements: "தேவைகள்", Constraints: "கட்டுப்பாடுகள்", "Output Format": "வெளியீட்டு வடிவம்", "Success Criteria": "வெற்றி அளவுகோல்கள்", Task: "பணி", Goal: "இலக்கு", Output: "வெளியீடு" },
  telugu: { Mode: "మోడ్", Role: "పాత్ర", Objective: "లక్ష్యం", Context: "సందర్భం", Requirements: "అవసరాలు", Constraints: "పరిమితులు", "Output Format": "అవుట్‌పుట్ ఫార్మాట్", "Success Criteria": "విజయ ప్రమాణాలు", Task: "పని", Goal: "లక్ష్యం", Output: "అవుట్‌పుట్" },
  kannada: { Mode: "ಮೋಡ್", Role: "ಪಾತ್ರ", Objective: "ಉದ್ದೇಶ", Context: "ಸಂದರ್ಭ", Requirements: "ಅವಶ್ಯಕತೆಗಳು", Constraints: "ಮಿತಿಗಳು", "Output Format": "ಔಟ್‌ಪುಟ್ ಸ್ವರೂಪ", "Success Criteria": "ಯಶಸ್ಸಿನ ಮಾನದಂಡಗಳು", Task: "ಕಾರ್ಯ", Goal: "ಗುರಿ", Output: "ಔಟ್‌ಪುಟ್" },
  malayalam: { Mode: "മോഡ്", Role: "പങ്ക്", Objective: "ലക്ഷ്യം", Context: "സന്ദർഭം", Requirements: "ആവശ്യകതകൾ", Constraints: "പരിമിതികൾ", "Output Format": "ഔട്ട്പുട്ട് ഫോർമാറ്റ്", "Success Criteria": "വിജയ മാനദണ്ഡങ്ങൾ", Task: "ചുമതല", Goal: "ലക്ഷ്യം", Output: "ഔട്ട്പുട്ട്" },
  punjabi: { Mode: "ਮੋਡ", Role: "ਭੂਮਿਕਾ", Objective: "ਉਦੇਸ਼", Context: "ਸੰਦਰਭ", Requirements: "ਲੋੜਾਂ", Constraints: "ਸੀਮਾਵਾਂ", "Output Format": "ਆਉਟਪੁੱਟ ਫਾਰਮੈਟ", "Success Criteria": "ਸਫਲਤਾ ਦੇ ਮਾਪਦੰਡ", Task: "ਕੰਮ", Goal: "ਟੀਚਾ", Output: "ਆਉਟਪੁੱਟ" },
  urdu: { Mode: "موڈ", Role: "کردار", Objective: "مقصد", Context: "سیاق", Requirements: "تقاضے", Constraints: "پابندیاں", "Output Format": "آؤٹ پٹ فارمیٹ", "Success Criteria": "کامیابی کے معیار", Task: "کام", Goal: "مقصد", Output: "آؤٹ پٹ" },
};

export function applyOutputLanguage(prompt: string, outputLanguage: LanguageId): string {
  if (outputLanguage === "english") return prompt;
  const dictionary = labels[outputLanguage];
  return prompt.split("\n").map((line) => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) return line;
    const label = dictionary[match[1]] ?? match[1];
    return `${label}: ${match[2]}`;
  }).join("\n");
}

export function languageInstruction(inputLanguage: LanguageId, outputLanguage: LanguageId, outputStyle?: string): string {
  const input = getLanguage(inputLanguage).name;
  const output = getLanguage(outputLanguage).name;
  const style = outputLanguage === "english" && outputStyle ? ` Use a ${outputStyle} English style.` : "";
  return `The user's input is in ${input}. Optimize the intent rather than translating word by word. Return the final optimized prompt in ${output}.${style} Preserve names, numbers, URLs, product names, technical terms, and required keywords exactly where possible. Support mixed-language input and do not add explanations outside the prompt.`;
}

export function isLanguageId(value: unknown): value is LanguageId {
  return typeof value === "string" && LANGUAGE_CONFIG.some((language) => language.id === value);
}
