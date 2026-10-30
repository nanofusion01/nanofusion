"use client";

import { useEffect, useState } from "react";

/**
 * Video na pozadí úvodní sekce. Nejdřív se zobrazí náhled z YouTube a samotné
 * video (několik MB) se načte až po dokončení načítání stránky, aby nebrzdilo
 * vykreslení obsahu (Largest Contentful Paint).
 */
export function HeroVideo({ ytId }: { ytId: string }) {
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    const start = () => setTimeout(() => setLoadVideo(true), 800);
    if (document.readyState === "complete") {
      const t = start();
      return () => clearTimeout(t);
    }
    let t: ReturnType<typeof setTimeout> | undefined;
    const onLoad = () => {
      t = start();
    };
    window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      if (t) clearTimeout(t);
    };
  }, []);

  return (
    <>
      {/* náhled videa - okamžitě viditelný */}
      <img
        src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {loadVideo && (
        <iframe
          title="Video NANOfusion na pozadí"
          aria-hidden="true"
          tabIndex={-1}
          className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&playsinline=1&rel=0`}
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      )}
    </>
  );
}
