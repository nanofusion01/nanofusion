"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCarousel } from "@/hooks/useCarousel";
import { CarouselArrows } from "@/components/ui/carousel-arrows";
import { Modal } from "@/components/ui/modal";

// Slug hodnoty musí sedět na to, co je SKUTEČNĚ v services.slug v DB.
// Všech 12 služeb má teď český slug (viz migrace provedená přímo v DB) -
// klíče tu zůstávají i anglické/staré, protože takhle mohou být zapsané
// v `target_service` komentářích starších článků, ale VÝSLEDNÝ slug musí
// být vždy ten aktuální český, jinak "Spočítat cenu" zase skončí na 404.
const SERVICE_MAP: Record<string, { slug: string; name: string }> = {
  'kalkulacka': { slug: '', name: 'Kalkulačka' },
  'facade': { slug: 'cisteni-fasad', name: 'Čištění fasád' },
  'sluzby/facade': { slug: 'cisteni-fasad', name: 'Čištění fasád' },
  'cisteni-fasad': { slug: 'cisteni-fasad', name: 'Čištění fasád' },

  'roof': { slug: 'cisteni-strech', name: 'Čištění střech' },
  'sluzby/roof': { slug: 'cisteni-strech', name: 'Čištění střech' },
  'cisteni-strech': { slug: 'cisteni-strech', name: 'Čištění střech' },

  'pavement': { slug: 'cisteni-dlazby', name: 'Čištění dlažeb' },
  'sluzby/pavement': { slug: 'cisteni-dlazby', name: 'Čištění dlažeb' },
  'cisteni-dlazby': { slug: 'cisteni-dlazby', name: 'Čištění dlažeb' },

  'pv': { slug: 'cisteni-fotovoltaiky', name: 'Čištění fotovoltaiky' },
  'sluzby/pv': { slug: 'cisteni-fotovoltaiky', name: 'Čištění fotovoltaiky' },
  'cisteni-fotovoltaiky': { slug: 'cisteni-fotovoltaiky', name: 'Čištění fotovoltaiky' },

  'graffiti': { slug: 'odstraneni-graffiti', name: 'Odstranění graffiti' },
  'sluzby/graffiti': { slug: 'odstraneni-graffiti', name: 'Odstranění graffiti' },
  'odstraneni-graffiti': { slug: 'odstraneni-graffiti', name: 'Odstranění graffiti' },

  'industrial': { slug: 'prumyslove-cisteni', name: 'Průmyslové čištění' },
  'sluzby/industrial': { slug: 'prumyslove-cisteni', name: 'Průmyslové čištění' },
  'prumyslove-cisteni': { slug: 'prumyslove-cisteni', name: 'Průmyslové čištění' },

  'facade-paint': { slug: 'natery-fasad', name: 'Nátěry fasád' },
  'sluzby/facade-paint': { slug: 'natery-fasad', name: 'Nátěry fasád' },
  'natery-fasad': { slug: 'natery-fasad', name: 'Nátěry fasád' },

  'roof-paint': { slug: 'natery-strech', name: 'Nátěry střech' },
  'sluzby/roof-paint': { slug: 'natery-strech', name: 'Nátěry střech' },
  'natery-strech': { slug: 'natery-strech', name: 'Nátěry střech' },

  'impregnation': { slug: 'nano-impregnace', name: 'Nano impregnace' },
  'sluzby/impregnation': { slug: 'nano-impregnace', name: 'Nano impregnace' },
  'nano-impregnace': { slug: 'nano-impregnace', name: 'Nano impregnace' },

  'antislip': { slug: 'protiskluzove-natery', name: 'Protiskluzové nátěry' },
  'sluzby/antislip': { slug: 'protiskluzove-natery', name: 'Protiskluzové nátěry' },
  'protiskluzove-natery': { slug: 'protiskluzove-natery', name: 'Protiskluzové nátěry' },

  'ceramfloor': { slug: 'ochrana-podlah-ceramfloor', name: 'Ochrana dlažeb CeramFloor' },
  'sluzby/ceramfloor': { slug: 'ochrana-podlah-ceramfloor', name: 'Ochrana dlažeb CeramFloor' },
  'ochrana-podlah-ceramfloor': { slug: 'ochrana-podlah-ceramfloor', name: 'Ochrana dlažeb CeramFloor' },

  'antibac': { slug: 'antibakterialni-ochrana', name: 'Antibakteriální ochrana' },
  'sluzby/antibac': { slug: 'antibakterialni-ochrana', name: 'Antibakteriální ochrana' },
  'antibakterialni-ochrana': { slug: 'antibakterialni-ochrana', name: 'Antibakteriální ochrana' },
};

function getTargetService(article: any) {
  let target = article.service_slug || article.service_id || article.service;
  if (!target && article.content) {
    const match = article.content.match(/<!--\s*target_service:\s*(.*?)\s*-->/);
    if (match) {
      target = match[1].trim();
    }
  }

  if (!target || target === 'kalkulacka') {
    return null;
  }

  const normalized = target.replace(/^\/+/g, '').replace(/^sluzby\//, 'sluzby/');
  if (SERVICE_MAP[normalized]) return SERVICE_MAP[normalized];
  if (SERVICE_MAP[target]) return SERVICE_MAP[target];

  return { slug: target.replace(/^sluzby\//, ''), name: 'Související služba' };
}

function ArticleCard({ article, onClick }: { article: any; onClick: () => void }) {
  const targetService = getTargetService(article);
  let dateString = article.published_at || article.created_at;
  let formattedDate = "Neznámé datum";
  if (dateString) {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    } else {
      formattedDate = dateString;
    }
  }

  return (
    <div 
      onClick={onClick}
      className="group/card flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 h-auto w-[85vw] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] shrink-0 cursor-pointer"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
        {article.hero_image_url ? (
          <img 
            src={article.hero_image_url} 
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="text-amber-500 font-bold text-xs uppercase tracking-wider mb-3 flex flex-wrap items-center gap-2">
          <span>AKTUALITA • {formattedDate}</span>
          {targetService && (
            <span className="bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {targetService.name}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-6 group-hover/card:text-amber-600 transition-colors line-clamp-3 leading-snug">
          {article.title}
        </h3>
        
        <div className="mt-auto flex items-center text-amber-500 font-bold text-sm transition-colors">
          Číst článek 
          <svg className="ml-1 w-4 h-4 transition-transform group-hover/card:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ArticleModalContent({ article, onClose }: { article: any; onClose: () => void }) {
  const router = useRouter();
  const targetService = getTargetService(article);

  let dateString = article.published_at || article.created_at;
  let formattedDate = "Neznámé datum";
  if (dateString) {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    } else {
      formattedDate = dateString;
    }
  }

  // Clean comment from content for display
  const cleanedContent = (article.content || '').replace(/<!--\s*target_service:\s*.*?\s*-->/g, '').trim();

  return (
    <div className="flex flex-col">
      {/* Hero Image */}
      <div className="w-full aspect-video md:h-[360px] relative rounded-3xl overflow-hidden bg-slate-100">
        {article.hero_image_url ? (
          <img 
            src={article.hero_image_url} 
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">Bez obrázku</span>
          </div>
        )}
      </div>

      {/* Header Info & CTA Card */}
      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Title & Badges */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-[#1a1a24] mb-4 leading-tight">
            {article.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-sm font-bold mb-4">
            <div className="bg-[#fff8eb] text-amber-500 px-4 py-2 rounded-full uppercase tracking-wide text-xs">
              AKTUALITA
            </div>
            <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-xs">
              {formattedDate}
            </div>
            {targetService && (
              <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-xs flex items-center gap-1.5 font-bold">
                <span>🔧</span>
                {targetService.name}
              </div>
            )}
          </div>

          {article.excerpt && (
            <p className="text-gray-600 font-medium leading-relaxed border-l-4 border-amber-500 pl-4 my-2">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Right Column: CTA */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-amber-500 rounded-3xl p-8 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-3">
              {targetService ? `Zaujala vás tato služba?` : "Zaujal vás tento článek?"}
            </h3>
            <p className="text-amber-50 text-sm mb-6 leading-relaxed">
              {targetService ? `Rádi pro vás připravíme nezávaznou kalkulaci pro ${targetService.name.toLowerCase()} zdarma.` : "Rádi pro vás připravíme nezávaznou kalkulaci zdarma."}
            </p>
            <button 
              onClick={() => {
                onClose();
                if (targetService?.slug) {
                  router.push(`/sluzby/${targetService.slug}#kalkulacka`);
                } else {
                  setTimeout(() => {
                    const el = document.getElementById("kalkulacka");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }
              }}
              className="block w-full bg-white text-amber-600 hover:bg-slate-50 hover:scale-105 active:scale-95 font-bold py-3.5 px-6 rounded-2xl text-center transition-all shadow-sm cursor-pointer"
            >
              Spočítat cenu
            </button>
          </div>
        </div>
      </div>

      {/* Full Content */}
      {cleanedContent && (
        <div className="mt-8 border border-gray-200 rounded-3xl p-8 bg-white">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            Obsah článku
          </h4>
          <div 
            className="prose prose-slate max-w-none text-gray-600 leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: cleanedContent }} 
          />
        </div>
      )}
    </div>
  );
}

export function ArticlesCarousel({ articles }: { articles: any[] }) {
  const { scrollRef, scrollByAmount, canScrollLeft, canScrollRight } = useCarousel(1);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  if (!articles || articles.length === 0) return null;

  return (
    <>
      <div className="relative group">
        <CarouselArrows 
          onScroll={scrollByAmount} 
          canScrollLeft={canScrollLeft} 
          canScrollRight={canScrollRight} 
        />

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 sm:gap-8 hide-scrollbar pb-8 pt-4 px-[7.5vw] md:px-1"
        >
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
          ))}
        </div>
      </div>

      <Modal isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title="">
        {selectedArticle && (
          <ArticleModalContent 
            article={selectedArticle} 
            onClose={() => setSelectedArticle(null)} 
          />
        )}
      </Modal>
    </>
  );
}
