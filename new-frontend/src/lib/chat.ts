/**
 * Čistá logika chatu s Nanobotem (bez Reactu) - validace odpovědí v řízeném
 * dialogu, rozpoznání kontaktu, vyhledání odpovědi ve znalostní bázi
 * a zpracování značky [LEAD: ...] z odpovědi AI.
 */

export interface KnowledgeEntry {
  keywords: string[];
  answer: string;
}

/** Odpovědi pro případ, že v administraci nejsou žádné předdefinované znalosti. */
export const FALLBACK_KNOWLEDGE: Record<string, KnowledgeEntry> = {
  okapy: {
    keywords: ["okap", "rýny", "odtok"],
    answer:
      "Ano, čištění a kontrola okapů je standardní součástí naší renovace střech. Chceme, aby váš dům po našem zásahu fungoval jako celek. Máte okapy hodně zanesené?",
  },
  zaruka: {
    keywords: ["záruk", "garanc", "jak dlouho vydrží"],
    answer:
      "U naší nano-ochrany dáváme garanci až 10 let na funkčnost povrchu. Technologie NANOfusion zabraňuje hloubkovému usazování nečistot a růstu mechů.",
  },
  rychlost: {
    keywords: ["jak dlouho to trvá", "termín", "kdy začnete"],
    answer:
      "Většinu rodinných domů stihneme kompletně vyčistit a ošetřit během 1 až 2 dnů. Aktuálně máme volné termíny v horizontu 14 dnů.",
  },
  cena: {
    keywords: ["cena", "kolik to stojí", "rozpočet", "peněz"],
    answer:
      "Cena je individuální a závisí na ploše a stavu povrchu. Abych vám mohl říct aspoň orientační rozmezí, potřeboval bych znát přibližnou plochu v m².",
  },
};

export const DEFAULT_GREETING_BUTTONS = [
  "Čištění střechy/fasády",
  "Solární panely",
  "Nátěry střech/fasád",
  "Služby pro firmy",
];

/**
 * Sestaví znalostní bázi z položek kategorie „předdefinované“ v administraci
 * (titulek = klíčová slova oddělená čárkou, obsah = odpověď).
 */
export function buildKnowledgeBase(
  rows: { title: string; content: string; category: string | null }[]
): Record<string, KnowledgeEntry> {
  const kb: Record<string, KnowledgeEntry> = {};
  for (const row of rows) {
    if (row.category !== "předdefinované") continue;
    kb[row.title.toLowerCase().replace(/\s/g, "_")] = {
      keywords: row.title
        .toLowerCase()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      answer: row.content,
    };
  }
  return Object.keys(kb).length > 0 ? kb : FALLBACK_KNOWLEDGE;
}

/** Odpověď ze znalostní báze, pokud dotaz obsahuje některé klíčové slovo. */
export function matchKnowledge(input: string, kb: Record<string, KnowledgeEntry>): string | null {
  const lower = input.toLowerCase();
  for (const entry of Object.values(kb)) {
    if (entry.keywords.some((k) => k && lower.includes(k))) return entry.answer;
  }
  return null;
}

/** Je zadaná lokalita smysluplná (aspoň 2 písmena, ne jen číslo)? */
export function isValidLocation(input: string): boolean {
  const trimmed = input.trim();
  const letters = trimmed.replace(/[^a-zA-Zá-žÁ-Ž]/g, "");
  return trimmed.length >= 2 && letters.length >= 2 && !/^\d+$/.test(trimmed);
}

/**
 * Plocha v m² z volného textu: první číslo, mezery jako oddělovač tisíců
 * („cca 120 m2“ → "120", „1 200 m²“ → "1200"), nebo null.
 */
export function parseArea(input: string): string | null {
  const match = input.match(/\d{1,3}(?:[ \u00a0]\d{3})+|\d+/);
  if (!match) return null;
  const digits = match[0].replace(/\D/g, "");
  return parseInt(digits, 10) >= 1 ? digits : null;
}

/** Rozpozná telefon nebo e-mail; odmítne zjevně vymyšlená čísla. */
export function parseContact(input: string): { kind: "email" | "phone"; value: string } | null {
  const value = input.trim();
  if (value.includes("@") && value.includes(".")) return { kind: "email", value };
  const digits = value.replace(/[\s\-()+]/g, "");
  const isValidPhone =
    /^\d{9,15}$/.test(digits) && !/^(\d)\1+$/.test(digits) && digits !== "123456789" && digits !== "987654321";
  return isValidPhone ? { kind: "phone", value } : null;
}

export interface LeadTag {
  name?: string;
  contact?: string;
  address?: string;
  area?: string;
}

/**
 * AI asistent po získání kontaktu vloží do odpovědi značku
 * [LEAD: jméno, kontakt, adresa, plocha]. Vrátí údaje a text bez značky.
 */
export function extractLeadTag(reply: string): { lead: LeadTag | null; text: string } {
  const match = reply.match(/\[LEAD:\s*(.*?)\]/i);
  if (!match) return { lead: null, text: reply };
  const [name, contact, address, area] = match[1].split(",").map((s) => s.trim() || undefined);
  return { lead: { name, contact, address, area }, text: reply.replace(match[0], "").trim() };
}
