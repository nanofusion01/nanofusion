import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
export type { Database };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function optimizeImg(url: string | null | undefined, width: number = 800) {
  if (!url || typeof url !== "string") return url || "";
  let normalized = url;

  if (!url.startsWith("http") && !url.startsWith("//")) {
    normalized = `${supabaseUrl}/storage/v1/object/public/${url}`;
  } else if (url.startsWith("//")) {
    normalized = "https:" + url;
  }

  // Zmenšení přes Supabase Image Transformation (/render/image) - jen u obrázků
  // z našeho Supabase Storage; SVG a cizí domény necháme beze změny.
  // (Dřív přes externí bezplatnou proxy wsrv.nl, na které byl web závislý.)
  const marker = "/storage/v1/object/public/";
  if (
    normalized.toLowerCase().split("?")[0].endsWith(".svg") ||
    !normalized.startsWith(supabaseUrl) ||
    !normalized.includes(marker)
  ) {
    return normalized;
  }

  const rendered = normalized.replace(marker, "/storage/v1/render/image/public/");
  const sep = rendered.includes("?") ? "&" : "?";
  return `${rendered}${sep}width=${Math.min(Math.round(width), 2500)}&quality=80`;
}
