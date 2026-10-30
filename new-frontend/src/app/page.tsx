import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Services } from "@/components/home/Services";
import { Realizations } from "@/components/home/Realizations";
import { Process } from "@/components/home/Process";
import { Reviews } from "@/components/home/Reviews";
import { Videos } from "@/components/home/Videos";
import { Articles } from "@/components/home/Articles";
import { FAQ } from "@/components/home/FAQ";
import { Configurator } from "@/components/home/Configurator";
import { Contact } from "@/components/home/Contact";
import { supabase } from "@/lib/supabase";
import { SITE_URL, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "NANOfusion | Čištění a nano-ochrana střech, fasád a dlažeb",
  description:
    "Specialisté na profesionální čištění a dlouhodobou nano-ochranu střech, fasád, dlažeb a fotovoltaiky. Více než 950 realizovaných projektů s garancí až 10 let.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NANOfusion | Čištění a nano-ochrana střech, fasád a dlažeb",
    description:
      "Specialisté na profesionální čištění a dlouhodobou nano-ochranu střech, fasád, dlažeb a fotovoltaiky. Více než 950 realizovaných projektů s garancí až 10 let.",
    type: "website",
    url: SITE_URL,
    siteName: "NANOfusion",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "NANOfusion",
      },
    ],
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "NANOfusion | Čištění a nano-ochrana střech, fasád a dlažeb",
    description:
      "Specialisté na profesionální čištění a dlouhodobou nano-ochranu střech, fasád, dlažeb a fotovoltaiky.",
    images: [OG_IMAGE],
  },
};

export default async function Home() {
  // Skutečné recenze (importované z Google/Firmy.cz i ručně přidané admiem
  // v Admin -> Recenze) žijí v `external_reviews`, ne v tabulce `reviews` -
  // ta je prázdná, takže se sem donedávna nikdy nic reálného nedostalo a
  // homepage vždycky padala na natvrdo napsaný fallback v Reviews.tsx.
  const { data: externalReviews } = await supabase
    .from('external_reviews')
    .select('*')
    .eq('approved', true)
    .order('published_at', { ascending: false });

  const reviews = (externalReviews || []).map((r) => ({
    id: r.id,
    name: r.author,
    text: r.content,
    rating: r.rating,
    // štítek podle skutečného zdroje - ručně zadané recenze nejsou „ověřené“ portálem
    source: r.source?.toLowerCase().includes('google')
      ? 'Ověřeno na Google'
      : r.source?.toLowerCase().includes('firmy')
        ? 'Ověřeno na Firmy.cz'
        : 'Recenze zákazníka',
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Hero />
        <Services />
        <Process />
        <Realizations />
        <Reviews initialReviews={reviews || []} />
        <Articles />
        <Videos />
        <FAQ />
        <Configurator />
        <Contact />
      </main>
    </div>
  );
}
