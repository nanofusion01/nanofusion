import { describe, it, expect } from "vitest";
import {
  buildKnowledgeBase,
  extractLeadTag,
  FALLBACK_KNOWLEDGE,
  isValidLocation,
  matchKnowledge,
  parseArea,
  parseContact,
} from "../lib/chat";

describe("Chat – řízený dialog", () => {
  it("přijme město a odmítne nesmysly", () => {
    expect(isValidLocation("Brno")).toBe(true);
    expect(isValidLocation("Praha 5, Smíchov")).toBe(true);
    expect(isValidLocation("12345")).toBe(false);
    expect(isValidLocation("x")).toBe(false);
  });

  it("vytáhne plochu z volného textu", () => {
    expect(parseArea("cca 120 m2")).toBe("120");
    expect(parseArea("1 200 m²")).toBe("1200");
    expect(parseArea("150")).toBe("150");
    expect(parseArea("nevím")).toBeNull();
    expect(parseArea("0")).toBeNull();
  });

  it("rozpozná telefon a e-mail a odmítne vymyšlená čísla", () => {
    expect(parseContact("774 509 409")).toEqual({ kind: "phone", value: "774 509 409" });
    expect(parseContact("+420 774 509 409")?.kind).toBe("phone");
    expect(parseContact("jan@firma.cz")).toEqual({ kind: "email", value: "jan@firma.cz" });
    expect(parseContact("123456789")).toBeNull();
    expect(parseContact("111111111")).toBeNull();
    expect(parseContact("12345")).toBeNull();
  });
});

describe("Chat – znalostní báze", () => {
  it("sestaví bázi z předdefinovaných položek administrace", () => {
    const kb = buildKnowledgeBase([
      { title: "okap, žlab", content: "Okapy čistíme.", category: "předdefinované" },
      { title: "Jiné", content: "Ignorovat", category: "obecne" },
    ]);
    expect(matchKnowledge("Čistíte i žlab?", kb)).toBe("Okapy čistíme.");
    expect(matchKnowledge("Ignorovat", kb)).toBeNull();
  });

  it("bez předdefinovaných položek použije výchozí odpovědi", () => {
    expect(buildKnowledgeBase([])).toBe(FALLBACK_KNOWLEDGE);
    expect(matchKnowledge("Jakou dáváte záruku?", FALLBACK_KNOWLEDGE)).toContain("garanci");
  });
});

describe("Chat – značka [LEAD] z odpovědi AI", () => {
  it("vytáhne údaje a odstraní značku z textu", () => {
    const { lead, text } = extractLeadTag("Děkuji, ozveme se! [LEAD: Jan Novák, 774509409, Brno, 120]");
    expect(lead).toEqual({ name: "Jan Novák", contact: "774509409", address: "Brno", area: "120" });
    expect(text).toBe("Děkuji, ozveme se!");
  });

  it("bez značky vrátí text beze změny", () => {
    expect(extractLeadTag("Dobrý den")).toEqual({ lead: null, text: "Dobrý den" });
  });
});
