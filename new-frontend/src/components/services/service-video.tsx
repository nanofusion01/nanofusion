
/** Video ke službě (YouTube nebo soubor). */
function parseVideoSource(url: string | null | undefined) {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();

  // YouTube (watch, shorts, embed, youtu.be)
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch) {
    return {
      type: "youtube" as const,
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      id: ytMatch[1],
    };
  }

  // Google Drive preview link
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return {
      type: "iframe" as const,
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      type: "iframe" as const,
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Direct video URL (.mp4, .webm, storage bucket...)
  return {
    type: "video" as const,
    src: trimmed,
  };
}

export function ServiceVideo({ videoUrl, serviceName }: { videoUrl: string | null | undefined; serviceName: string }) {
  const parsed = parseVideoSource(videoUrl);
  if (!parsed) return null;

  return (
    <section id="video" className="py-20 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F7A51D_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="text-amber-500 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-4 py-1.5 rounded-full inline-block mb-3 border border-amber-500/20">
            Video z realizace
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Podívejte se, jak probíhá {serviceName.toLowerCase()}
          </h2>
          <p className="text-slate-400 mt-3 text-base md:text-lg max-w-2xl mx-auto">
            Reálná ukázka naší práce a dosažených výsledků přímo v terénu.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-black aspect-video max-w-4xl mx-auto">
          {parsed.type === "youtube" || parsed.type === "iframe" ? (
            <iframe
              src={parsed.src}
              title={`Video - ${serviceName}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={parsed.src}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
