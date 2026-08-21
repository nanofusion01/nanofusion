import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://nanofusion.cz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: services } = await supabase
    .from("services")
    .select("slug, updated_at")
    .eq("is_active", true);

  const serviceEntries: MetadataRoute.Sitemap = (services || []).map((s) => ({
    url: `${BASE_URL}/sluzby/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/o-nas`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/sluzby`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/kalkulace`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/gdpr`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/obchodni-podminky`, changeFrequency: "yearly", priority: 0.3 },
  ].map((e) => ({ ...e, lastModified: new Date() }));

  return [...staticEntries, ...serviceEntries];
}
