import DOMPurify from "isomorphic-dompurify";

/**
 * Bezpečná sanitizace HTML před vykreslením přes dangerouslySetInnerHTML.
 * Využívá DOMPurify (přes isomorphic-dompurify pro SSR i klientský rendering),
 * které spolehlivě eliminuje XSS útoky (včetně mXSS, bypassů přes SVG, javascript: URI,
 * event handlery a vnořené tagy), přičemž zachovává bezpečné formátování z CMS.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
}
