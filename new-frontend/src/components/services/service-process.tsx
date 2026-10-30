import { Clock } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

/** Krok postupu práce: z administrace (site_config) nebo z doplňkového obsahu služby. */
export type ProcessStepItem = { id?: string; step?: string; title: string; desc?: string; description?: string };

/** Postup práce krok za krokem. */
export function ServiceProcess({
  serviceName,
  steps,
  processNote,
}: {
  serviceName: string;
  steps: ProcessStepItem[];
  processNote?: string;
}) {
  if (!steps || steps.length === 0) return null;

  const count = steps.length;
  const isCompact = count > 4;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-amber-500">Jak čištění probíhá</h2>
        </div>

        {/* Vždy v jednom řádku na větších obrazovkách */}
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 sm:gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.id ?? idx}
              className={`flex-1 min-w-0 bg-white rounded-2xl border-2 border-amber-500 shadow-xl shadow-amber-500/5 flex flex-col items-center text-center relative ${
                isCompact ? "p-5 md:p-6" : "p-6 md:p-8"
              }`}
            >
              <div
                className={`bg-amber-500 rounded-full flex items-center justify-center font-black text-white shadow-lg shadow-amber-500/30 ${
                  isCompact ? "w-12 h-12 text-lg mb-4" : "w-16 h-16 text-2xl mb-6"
                }`}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3 className={`font-bold text-slate-900 mb-3 ${isCompact ? "text-lg" : "text-xl"}`}>{step.title}</h3>
              <p className={`text-slate-600 leading-relaxed ${isCompact ? "text-sm" : "text-base"}`}>
                {step.desc ?? step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-md border border-slate-100">
            <Clock className="w-6 h-6 text-amber-500 shrink-0" />
            <span className="text-lg font-medium text-slate-800">
              {processNote ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(
                      processNote.replace(
                        /\d+\s*(?:až|do|a)?\s*\d*\s*(?:dny|dní|hodiny|hodin|den)/g,
                        (match) => `<strong class="text-amber-500">${match}</strong>`
                      )
                    ),
                  }}
                />
              ) : (
                <>
                  Čištění a ochranu {serviceName.toLowerCase().includes("střech") ? "střechy" : "povrchu"} stihneme za{" "}
                  <strong className="text-amber-500">1 až 2 pracovní dny</strong>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
