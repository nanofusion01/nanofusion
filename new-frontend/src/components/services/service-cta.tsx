import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Výzva ke kontaktu na konci stránky služby. */
export function ServiceCTA() {
  return (
    <section className="py-20 bg-slate-900 border-t-4 border-amber-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-black text-white mb-6">Chcete vědět více?</h2>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">
          Zanechte nám na sebe kontakt a my se vám co nejdříve ozveme s nezávaznou nabídkou pro vaši konkrétní situaci.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Button
            href="#kalkulacka"
            className="h-16 px-10 text-lg font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-xl shadow-amber-500/20"
          >
            SPOČÍTEJTE SI CENU <span className="ml-2">→</span>
          </Button>
          <a
            href="tel:+420774509409"
            className="inline-flex items-center justify-center gap-3 h-16 px-10 text-lg font-bold rounded-xl bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
          >
            <Phone className="w-5 h-5 text-amber-500" />
            +420 774 509 409
          </a>
        </div>
      </div>
    </section>
  );
}
