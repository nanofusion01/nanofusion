/**
 * Recenze se na webu i v adminu vždy zobrazují jako čistý text (nikdy
 * dangerouslySetInnerHTML) - proto se do jejich obsahu nesmí dostat žádné
 * HTML. Stávalo se, že se do textového pole rukou nakopírovala recenze i s
 * formátováním (Tiptap editor si HTML z clipboardu ponechal), což pak na
 * webu vykreslilo doslovné "<p><span style=...>" místo textu. Tahle funkce
 * to vždy ořízne na čistý text, ať zdroj obsahuje HTML nebo ne. Používá se
 * na každém místě, kde obsah recenze vzniká - ruční přidání, hromadný
 * import, i oba scrapery (Firmy.cz, Google).
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
