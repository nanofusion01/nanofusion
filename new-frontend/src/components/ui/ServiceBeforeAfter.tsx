"use client";

import { useState, useRef, useEffect } from "react";
import { optimizeImg } from "@/lib/supabase";

interface Pair {
  before_url: string;
  after_url: string;
}

interface ServiceBeforeAfterProps {
  pairs: Pair[];
  /** Jak dlouho (ms) zůstane dvojice zobrazená, než se přepne na další. */
  rotateIntervalMs?: number;
}

export function ServiceBeforeAfter({ pairs, rotateIntervalMs = 6000 }: ServiceBeforeAfterProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const active = pairs[activeIndex];

  // Průběžné střídání dvojic, jen když je jich víc než jedna a uživatel zrovna
  // netahá za posuvník (nechceme mu obrázek vyměnit uprostřed porovnávání).
  useEffect(() => {
    if (pairs.length <= 1) return;
    const id = setInterval(() => {
      if (isDraggingRef.current) return;
      setActiveIndex((i) => (i + 1) % pairs.length);
      setHasInteracted(false);
      setSliderPosition(50);
    }, rotateIntervalMs);
    return () => clearInterval(id);
  }, [pairs.length, rotateIntervalMs]);

  // Demo oscilace posuvníku, dokud uživatel sám nezasáhne - upozorní na to,
  // že jde s obrázkem hýbat, a po přepnutí dvojice se spustí znovu.
  useEffect(() => {
    if (hasInteracted) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const animate = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current!;
      const oscillation = Math.sin(elapsed / 400) * 18;
      setSliderPosition(50 + oscillation);
      requestRef.current = requestAnimationFrame(animate);
    };

    startTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [hasInteracted, activeIndex]);

  const handleMove = (clientX: number) => {
    if (!hasInteracted) setHasInteracted(true);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const startDrag = () => { isDraggingRef.current = true; };
  const endDrag = () => { isDraggingRef.current = false; };

  if (!active) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-amber-500 mb-2">
          Před a Po
        </h2>
        <p className="text-gray-500 mb-10 text-lg">
          Táhněte posuvníkem a porovnejte rozdíl sami
        </p>

        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden aspect-[16/10] select-none shadow-xl border-2 border-amber-500 cursor-ew-resize touch-none"
          onMouseDown={(e) => { startDrag(); handleMove(e.clientX); }}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onMouseMove={onMouseMove}
          onTouchStart={(e) => { startDrag(); handleMove(e.touches[0].clientX); }}
          onTouchEnd={endDrag}
          onTouchMove={onTouchMove}
        >
          {/* After Image (Background) */}
          <img
            key={`after-${activeIndex}`}
            src={optimizeImg(active.after_url, 1000)}
            alt="Po"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            draggable={false}
          />

          {/* Before Image (Clipped) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              key={`before-${activeIndex}`}
              src={optimizeImg(active.before_url, 1000)}
              alt="Před"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              draggable={false}
            />
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)] pointer-events-none z-10"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.6)] text-white font-bold text-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-md pointer-events-none z-10">
            PŘED
          </div>
          <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-md pointer-events-none z-10">
            PO
          </div>

          {/* Fallback Range Input for accessibility and native mobile feeling */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => {
              if (!hasInteracted) setHasInteracted(true);
              setSliderPosition(Number(e.target.value));
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            aria-label="Porovnání před a po"
          />
        </div>

        {/* Tečky ukazující, kolikátá dvojice ze všech se právě zobrazuje */}
        {pairs.length > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {pairs.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); setHasInteracted(false); setSliderPosition(50); }}
                aria-label={`Zobrazit dvojici ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? "w-6 bg-amber-500" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
