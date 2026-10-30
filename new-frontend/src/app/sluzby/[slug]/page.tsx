import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Reviews } from "@/components/home/Reviews";
import { FAQ } from "@/components/home/FAQ";
import { ServiceBeforeAfter } from "@/components/ui/ServiceBeforeAfter";
import { ServiceGallery } from "@/components/ui/ServiceGallery";
import { localCatalog, type ServiceCatalogEntry } from "@/data/localCatalog";
import { SERVICE_PRICE_KEYS } from "@/data/servicePriceKeys";
import { SITE_URL, OG_IMAGE } from "@/lib/site";
import { parseFeature } from "@/lib/service-features";
import { ServiceHero } from "@/components/services/service-hero";
import { getSiteStats } from "@/lib/site-stats";
import { ServiceBenefits } from "@/components/services/service-benefits";
import { ServiceProcess } from "@/components/services/service-process";
import { ServiceVideo } from "@/components/services/service-video";
import { ServiceCTA } from "@/components/services/service-cta";


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const { data: services } = await supabase
    .from("services")
    .select("slug");

  return (services || []).map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!service) return { title: "Služba nenalezena | NANOfusion" };

  // Generate short description for meta
  const rawDesc = service.description || "";
  const plainText = rawDesc.replace(/<[^>]*>?/gm, '');
  const metaDesc = plainText.substring(0, 160).trim() + "...";

  const title = `${service.name} | NANOfusion`;
  const url = `${SITE_URL}/sluzby/${slug}`;
  const defaultImage = OG_IMAGE;
  // Pokusíme se vzít obrázek z hero nebo z fotek, jinak použijeme logo
  const ogImage = service.hero_image_url || defaultImage;

  return {
    title,
    description: metaDesc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: metaDesc,
      type: "website",
      url,
      siteName: "NANOfusion",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: service.name,
        },
      ],
      locale: "cs_CZ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDesc,
      images: [ogImage],
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!service || !service.is_active) {
    notFound();
  }

  const serviceId = service.id;

  const [faqsRes, beforeAfterRes, galleryRes, reviewsRes, configRes, siteStats] = await Promise.all([
    supabase
      .from("service_faqs")
      .select("*")
      .eq("service_id", serviceId)
      .eq("is_active", true)
      .order("order_index", { ascending: true }),
    supabase
      .from("service_before_after")
      .select("*")
      .eq("service_id", serviceId)
      .order("order_index", { ascending: true }),
    supabase
      .from("service_gallery")
      .select("*")
      .eq("service_id", serviceId)
      .order("order_index", { ascending: true }),
    supabase
      .from("service_reviews")
      .select("*")
      .eq("service_id", serviceId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("site_config")
      .select("*")
      .in("key", [`service_process_${serviceId}`, `service_process_${slug}`]),
    getSiteStats(),
  ]);

  const faqs = faqsRes.data || [];
  const beforeAfterPhotos = beforeAfterRes.data || [];
  const dbGalleryPhotos = galleryRes.data || [];
  const specificReviews = reviewsRes.data || [];

  // Použijeme localCatalog pro bohatý obsah, který není v Supabase tabulce (jako na starém webu)
  const localData: Partial<ServiceCatalogEntry> = localCatalog[slug] ?? {};

  const priceKey = SERVICE_PRICE_KEYS[slug] || localData.price_key || slug;
  const { data: priceData } = await supabase
    .from("configurator_prices")
    .select("price")
    .eq("item_key", priceKey)
    .maybeSingle();
  const basePrice = priceData?.price || 150;

  let customProcessSteps = localData.process || [];
  // Zkusíme přepsat z databáze, pokud tam něco je (pro zpětnou kompatibilitu)
  const processConfig = configRes.data?.find(c => c.key === `service_process_${serviceId}` || c.key === `service_process_${slug}`);
  if (processConfig && processConfig.value) {
    try {
      const parsed = JSON.parse(processConfig.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        customProcessSteps = parsed;
      }
    } catch (e) {
      console.error("Failed to parse custom process steps", e);
    }
  }

  // Admin umožňuje nahrát víc dvojic Před/Po - dřív se použila jen ta první,
  // teď jede celá sada a komponenta mezi nimi sama průběžně přepíná.
  const beforeAfterPairs = beforeAfterPhotos
    .flatMap((p) =>
      p.before_url && p.after_url && p.before_url !== p.after_url
        ? [{ before_url: p.before_url, after_url: p.after_url }]
        : []
    );
  const hasBeforeAfter = beforeAfterPairs.length > 0;

  let ytId = null;
  if (service.video_url) {
    const ytMatch = service.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch) ytId = ytMatch[1];
  }

  const processDescription = service.process_description || localData.what_included || "";
  const benefits = (service.features && service.features.length > 0)
    ? service.features.map(parseFeature)
    : (localData.benefits || []);
  // Galerie a recenze jen ze skutečných dat z administrace - žádné
  // ilustrační fotky ani ukázkové texty, které by se tvářily jako reálné.
  const gallery = dbGalleryPhotos.map((p) => p.url);
  const processNote = localData.process_note;

  const sourceLabel = (source?: string) =>
    source === "google" ? "Google" : source === "firmy.cz" ? "Firmy.cz" : "Recenze zákazníka";

  const mappedReviews = specificReviews.length > 0
    ? specificReviews.map((r) => ({
        id: r.id,
        name: r.author || "Zákazník",
        text: r.content,
        rating: r.rating || 5,
        source: sourceLabel(r.source),
      }))
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "provider": {
      "@type": "LocalBusiness",
      "name": "NANOfusion",
      "url": SITE_URL,
      "telephone": "+420774509409",
      "email": "info@nanofusion.cz",
    },
    "description": service.description ? service.description.replace(/<[^>]*>?/gm, '').substring(0, 160) : "",
    "areaServed": "CZ",
    "url": `${SITE_URL}/sluzby/${slug}`,
  };

  return (
    <main className="font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceHero service={service} ytId={ytId} basePrice={basePrice} siteStats={siteStats} />

      <ServiceBenefits processDescription={processDescription} benefits={benefits} />

      <ServiceProcess serviceName={service.name} steps={customProcessSteps} processNote={processNote} />

      {hasBeforeAfter && (
        <ServiceBeforeAfter pairs={beforeAfterPairs} />
      )}

      {gallery.length > 0 && (
        <ServiceGallery images={gallery} />
      )}

      <ServiceVideo videoUrl={service.video_url} serviceName={service.name} />

      {mappedReviews.length > 0 && (
        <Reviews initialReviews={mappedReviews} autoScroll={false} siteStats={siteStats} />
      )}

      {faqs.length > 0 && (
        <FAQ initialFaqs={faqs} />
      )}

      <ServiceCTA />
    </main>
  );
}
