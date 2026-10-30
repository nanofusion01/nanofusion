import { optimizeImg } from "@/lib/supabase";
import { Phone, Mail } from "lucide-react";
import { ServiceConfigurator } from "@/components/services/ServiceConfigurator";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Service } from "@/lib/types";

/** Úvodní sekce stránky služby: obrázek nebo video, název a konfigurátor ceny. */
export function ServiceHero({ service, ytId, basePrice }: { service: Service; ytId: string | null; basePrice: number }) {
  const stats = [
    "14 let zkušeností",
    "950+ dokončených projektů",
    "100% bezplatná konzultace"
  ];

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-slate-900 min-h-[80vh] flex items-center">
      <div className="absolute inset-0 z-0 opacity-40">
        {ytId ? (
          <img src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} className="w-full h-full object-cover" alt="" />
        ) : service.hero_image_url ? (
          <img src={optimizeImg(service.hero_image_url, 1600)} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full bg-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-black text-white mb-6 leading-tight drop-shadow-xl">
              {(() => {
                const parts = service.name.trim().split(" ");
                if (parts.length > 1) {
                  return (
                    <>
                      <span className="text-white">{parts[0]}</span>{" "}
                      <span className="text-amber-500">{parts.slice(1).join(" ")}</span>
                    </>
                  );
                }
                return <span className="text-amber-500">{service.name}</span>;
              })()}
            </h1>
            <div
              className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed font-light drop-shadow-md"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(service.description || "") }}
            />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-10 text-amber-500 font-bold text-sm md:text-base">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {stat}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="tel:+420774509409"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all font-bold"
              >
                <Phone className="w-4 h-4 text-amber-500" />
                +420 774 509 409
              </a>
              <a
                href="mailto:info@nanofusion.cz"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all font-bold"
              >
                <Mail className="w-4 h-4 text-amber-500" />
                info@nanofusion.cz
              </a>
            </div>
          </div>

          <div id="kalkulacka" className="relative w-full max-w-xl mx-auto lg:mr-0 z-20">
            <ServiceConfigurator basePrice={basePrice} serviceName={service.name} />
          </div>

        </div>
      </div>
    </section>
  );
}
