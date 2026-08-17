import { SectionHeader } from "@/components/ui/section-header";
import { supabase } from "@/lib/supabase";

async function getConfig() {
  const { data } = await supabase.from("site_config").select("key, value");
  return (data || []).reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);
}

function AboutStory({ description }: { description: string }) {
  return (
    <div 
      className="prose prose-slate lg:prose-lg max-w-none text-slate-600 space-y-6"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}

function AboutStats({ statsRaw }: { statsRaw: string }) {
  let stats: any[] = [];
  try {
    stats = JSON.parse(statsRaw || '[]');
  } catch (e) {
    stats = [];
  }

  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="text-amber-500 font-bold text-4xl mb-2 font-heading">{stat.value}</div>
          <h3 className="text-slate-500 text-sm uppercase tracking-wider font-bold">{stat.label}</h3>
        </div>
      ))}
    </div>
  );
}

function AboutCertifications({ title, subtitle, certsRaw }: { title: string, subtitle: string, certsRaw: string }) {
  let certs: any[] = [];
  try {
    certs = JSON.parse(certsRaw || '[]');
  } catch (e) {
    certs = [];
  }

  if (!certs || certs.length === 0) return null;

  return (
    <>
      <h3 className="text-3xl font-extrabold text-slate-900 mt-16 mb-4 text-center font-heading">{title}</h3>
      {subtitle && <p className="text-slate-500 text-center mb-8 max-w-2xl mx-auto">{subtitle}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        {certs.map((cert) => (
          <div key={cert.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
            {cert.imageUrl && (
              <img src={cert.imageUrl} alt={cert.title} className="w-full h-48 object-cover rounded-2xl mb-4" />
            )}
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">{cert.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{cert.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function AboutWhyUs({ title, pointsRaw }: { title: string, pointsRaw: string }) {
  let points: string[] = [];
  try {
    points = JSON.parse(pointsRaw || '[]');
  } catch (e) {
    points = [];
  }

  if (!points || points.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2rem] mt-16 relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-6 font-heading">{title}</h3>
        <ul className="space-y-4 opacity-90 text-lg">
          {points.map((point, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <span className="text-amber-500 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

export async function About() {
  const config = await getConfig();

  const title = config.about_title || "Příběh preciznosti a inovace";
  const subtitle = config.about_subtitle || "14 let pečujeme o to, co jste usilovně vybudovali";
  const description = config.about_description || "";
  const statsRaw = config.about_stats || "[]";
  const certsTitle = config.about_certs_title || "Naše certifikace a odbornost";
  const certsSubtitle = config.about_certs_subtitle || "";
  const certsRaw = config.about_certificates || "[]";
  const whyTitle = config.about_why_title || "Proč NANOfusion?";
  const whyPointsRaw = config.about_why_points || "[]";

  return (
    <section id="o-nas" className="py-12 md:py-16 bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          title={title}
          subtitle={subtitle}
        />

        <AboutStory description={description} />
        <AboutStats statsRaw={statsRaw} />
        <AboutCertifications title={certsTitle} subtitle={certsSubtitle} certsRaw={certsRaw} />
        <AboutWhyUs title={whyTitle} pointsRaw={whyPointsRaw} />
      </div>
    </section>
  );
}
