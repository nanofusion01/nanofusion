"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { CarouselArrows } from "@/components/ui/carousel-arrows";
import { Pill } from "@/components/ui/pill";
import { useCarousel } from "@/hooks/useCarousel";
import type { Review } from "@/lib/types";
import { SITE_STATS_DEFAULTS, type SiteStats } from "@/lib/site-stats";

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex-none w-[280px] md:w-[300px] bg-slate-800 rounded-2xl p-6 flex flex-col snap-center md:snap-start self-start"
    >
      <div className="text-amber-500 mb-3 flex gap-1">
        {Array.from({ length: review.rating ?? 5 }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      <p className="text-slate-300 italic mb-4 leading-relaxed line-clamp-4">
        „{review.text}“
      </p>
      <div>
        <p className="text-white font-bold">{review.name}</p>
        <p className="text-slate-400 text-sm">{review.source}</p>
      </div>
    </div>
  );
}

export function Reviews({
  initialReviews,
  autoScroll = true,
  siteStats = SITE_STATS_DEFAULTS,
}: {
  initialReviews?: Review[];
  autoScroll?: boolean;
  siteStats?: SiteStats;
}) {
  const { scrollRef, scrollByAmount, canScrollLeft, canScrollRight } = useCarousel(autoScroll ? 0.5 : 0, 350);

  // Jen skutečné recenze z administrace; bez nich se sekce nezobrazí
  const reviews = initialReviews ?? [];
  if (reviews.length === 0) return null;

  return (
    <section id="reference" className="py-10 md:py-12 bg-[#111111] font-sans relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative">

        <SectionHeader
          title="Co o nás říkají naši klienti"
          subtitle="Reference čerpáme z portálů Firmy.cz a Google. Spokojenost našich klientů je pro nás prioritou číslo jedna."
          variant="light"
        />

        <div className="flex flex-wrap justify-center gap-4 mb-12 relative z-10">
          <Pill
            href="https://www.firmy.cz/detail/12954501-nanofusion-s-r-o-blucina.html#hodnoceni"
            external
            icon={<span className="text-amber-500 font-black">★ {siteStats.rating_firmy}</span>}
          >
            Recenze na Firmy.cz ↗
          </Pill>
          <Pill
            href="https://www.google.com/search?q=NANOfusion+recenze"
            external
            icon={<span className="text-blue-400 font-black">★ {siteStats.rating_google}</span>}
          >
            Recenze na Google ↗
          </Pill>
        </div>

        {/* Carousel Container */}
        <div className="relative group">

          <CarouselArrows
            onScroll={scrollByAmount}
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
          />

          {/* Gradient Edges */}
          <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#111111] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#111111] to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar relative z-0 px-[calc(50%-160px)] md:px-0"
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
