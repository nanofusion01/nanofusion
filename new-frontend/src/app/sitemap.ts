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
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/o-nas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/sluzby`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/kalkulace`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/gdpr`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/obchodni-podminky`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticEntries, ...serviceEntries];
}
