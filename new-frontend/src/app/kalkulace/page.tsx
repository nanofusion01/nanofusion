"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { submitInquiry } from "@/lib/inquiry";
import { calculateSimplePrice } from "@/lib/calculator";
import { FormError } from "@/components/ui/form-error";
import { CALCULATOR_PRICE_KEY } from "@/data/servicePriceKeys";

export default function KalkulacePage() {
  const [area, setArea] = useState(100);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [botField, setBotField] = useState(""); // Honeypot anti-spam
  const [pricePerSqm, setPricePerSqm] = useState(120);
  const [showPrice, setShowPrice] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Načtení reálné ceny z DB configurator_prices (výchozí základ pro dlažby/čištění)
  useEffect(() => {
    async function loadPrice() {
      try {
        const { data } = await supabase
          .from("configurator_prices")
          .select("price")
          .eq("item_key", CALCULATOR_PRICE_KEY)
          .maybeSingle();

        if (data && typeof data.price === "number" && data.price > 0) {
          setPricePerSqm(data.price);
        }
      } catch (e) {
        console.warn("Failed to load configurator price:", e);
      }
    }
    loadPrice();
  }, []);

  const handleCalculateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!area || area <= 0) {
      setFormError("Zadejte prosím platnou plochu v m².");
      return;
    }

    setSubmitting(true);

    try {
      const total = calculateSimplePrice(area, pricePerSqm);
      setEstimatedPrice(total);

      await submitInquiry({
        name,
        phone,
        service: "Kalkulačka",
        message: `Plocha: ${area} m², Lokace: ${location.trim() || "Neuvedeno"}, Odhad ceny: ${total.toLocaleString()} Kč`,
        source: "Kalkulačka",
        botField,
        photo,
      });

      setShowPrice(true);
    } catch (error: any) {
      console.error("Chyba při odesílání poptávky:", error);
      setFormError(error.message || "Omlouváme se, nastala chyba při odesílání. Zkuste to prosím znovu nebo nám zavolejte.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pt-8 pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-amber-500 font-bold text-sm uppercase tracking-widest block mb-3">
                Bezplatná konzultace po celé ČR
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Nezávazná poptávka{" "}
                <span className="text-amber-500">NANOFusion</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg mx-auto">
                Získejte přesnou cenovou nabídku a bezplatnou konzultaci do 24
                hodin.
              </p>
            </div>

            <form
              onSubmit={handleCalculateAndSubmit}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-amber-500"
            >
              <div className="mb-8">
                <div className="font-bold text-xl mb-1">Kalkulace zdarma do 24 h</div>
                <div className="text-slate-500 text-sm">
                  Získejte okamžitý odhad ceny pro váš projekt.
                </div>
              </div>

              {/* Honeypot field - skryté pro lidi, viditelné pro roboty */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_url_check"
                  tabIndex={-1}
                  autoComplete="off"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block font-bold text-xs uppercase text-slate-500 mb-2">
                  Plocha v m²
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    min={10}
                    max={10000}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold text-lg bg-slate-50 outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                    m²
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-bold text-xs uppercase text-slate-500 mb-2">
                  Vaše jméno <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaše jméno"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-amber-500"
                />
              </div>

              <div className="mb-6">
                <label className="block font-bold text-xs uppercase text-slate-500 mb-2">
                  Město / Lokace
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Např. Praha, Brno, Beroun..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-amber-500"
                />
              </div>

              <div className="mb-6">
                <label className="block font-bold text-xs uppercase text-slate-500 mb-2">
                  Telefonní číslo <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefonní číslo"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-amber-500"
                />
              </div>

              <div className="mb-8">
                <label className="block font-bold text-xs uppercase text-slate-500 mb-2">
                  Fotografie objektu (nepovinné)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm bg-slate-50 cursor-pointer"
                />
              </div>

              <div className="mb-4">
                <FormError message={formError} />
              </div>

              {!showPrice ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg uppercase transition-colors"
                >
                  {submitting ? "Odesílám kalkulaci..." : "Zobrazit cenu a odeslat"}
                </button>
              ) : (
                <div className="text-center">
                  <span className="text-sm text-slate-500 font-semibold">
                    Předběžná cena pro vaši plochu:
                  </span>
                  <div className="text-5xl font-bold text-amber-500 my-2">
                    {estimatedPrice.toLocaleString()} Kč
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-emerald-700 font-bold text-sm border border-emerald-200 mb-8">
                    ✓ Úspěšně odesláno. Zavoláme vám.
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-slate-500 mt-4">
                Nezávazné a zdarma · odpověď do 24 h
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
