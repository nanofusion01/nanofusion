import { sanitizeHtml } from "@/lib/sanitize";

/** Sekce „Co nabízíme“: popis postupu a body výhod služby. */
export function ServiceBenefits({ processDescription, benefits }: { processDescription: string; benefits: { title: string; desc: string }[] }) {
  if (!processDescription && benefits.length === 0) return null;

  return (
    <section id="vyhody" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500 p-8 md:p-12 shadow-xl shadow-amber-500/5">
          {processDescription && (
            <div
              className="text-slate-700 text-lg leading-relaxed mb-10 prose prose-amber max-w-none prose-p:mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(processDescription) }}
            />
          )}

          {benefits.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Co nabízíme:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-amber-100 rounded-full p-1.5">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-800 mb-1">
                        {benefit.title}
                      </div>
                      {benefit.desc && (
                        <div className="text-slate-600 text-sm leading-relaxed">
                          {benefit.desc}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
