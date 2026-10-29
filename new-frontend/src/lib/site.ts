/**
 * Veřejné adresy webu. Výchozí hodnoty odpovídají produkci; dokud doména
 * nanofusion.cz neukazuje na tento web, nastavte na Vercelu
 * NEXT_PUBLIC_SITE_URL=https://nanofusion.vercel.app (canonical, sitemap,
 * Open Graph a strukturovaná data pak ukazují na skutečnou adresu webu).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://nanofusion.cz").replace(/\/$/, "");

/** Administrace (odkaz „Zaměstnanci“ v patičce). */
export const ADMIN_URL = (process.env.NEXT_PUBLIC_ADMIN_URL || "https://nanofusion-j3bs.vercel.app").replace(/\/$/, "");

/** Obrázek pro sdílení na sociálních sítích (soubor v public/). */
export const OG_IMAGE = `${SITE_URL}/logo.png`;
