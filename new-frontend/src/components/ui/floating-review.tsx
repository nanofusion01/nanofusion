import React from "react";

const FIRMY_CZ_PROFILE = "https://www.firmy.cz/detail/12954501-nanofusion-s-r-o-blucina.html";

export interface FloatingReviewData {
  author: string | null;
  content: string | null;
  source: string;
}

function sourceInfo(source: string): { label: string; href: string | null } {
  const s = source.toLowerCase();
  if (s.includes("google"))
    return { label: "Google Recenze", href: "https://www.google.com/search?q=NANOfusion+recenze" };
  if (s.includes("firmy")) return { label: "Firmy.cz", href: FIRMY_CZ_PROFILE };
  return { label: "Recenze zákazníka", href: null };
}

/** Plovoucí ukázka nejnovější skutečné recenze (z administrace) v úvodní sekci. */
export function FloatingReview({ review }: { review: FloatingReviewData | null }) {
  if (!review?.content) return null;
  const { label, href } = sourceInfo(review.source);
  const text = review.content.length > 160 ? `${review.content.slice(0, 157).trimEnd()}…` : review.content;
  const author = review.author || "Zákazník";

  const body = (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-1 text-amber-500 text-sm" aria-label="5 z 5 hvězdiček">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} aria-hidden="true">
              ★
            </span>
          ))}
        </div>
        <span className="text-white/80 text-xs font-semibold bg-white/10 px-2 py-1 rounded-full">{label}</span>
      </div>
      <p className="text-gray-200 text-sm italic font-medium leading-relaxed">„{text}“</p>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">
          {author.charAt(0).toUpperCase()}
        </div>
        <span className="text-gray-300 text-xs font-medium">{author}</span>
      </div>
    </>
  );

  const className =
    "hidden lg:flex absolute right-12 bottom-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-[320px] flex-col gap-3 z-30 shadow-2xl";

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:bg-white/20 transition-all cursor-pointer`}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}
