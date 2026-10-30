/**
 * Bod „Co nabízíme“ je v DB uložený jako text: buď JSON {title, desc},
 * nebo „Název - popis“ / „Název: popis“, případně jen název.
 */
export function parseFeature(feature: string): { title: string; desc: string } {
  try {
    const parsed: unknown = JSON.parse(feature);
    if (typeof parsed === "object" && parsed !== null) {
      const p = parsed as { title?: string; desc?: string; description?: string };
      return { title: p.title || "", desc: p.desc || p.description || "" };
    }
  } catch {
    // není JSON - zkusíme oddělovače níže
  }
  for (const sep of [" - ", ": "]) {
    if (feature.includes(sep)) {
      const [first, ...rest] = feature.split(sep);
      return { title: first.trim(), desc: rest.join(sep).trim() };
    }
  }
  return { title: feature, desc: "" };
}
