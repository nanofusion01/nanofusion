"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable automatic browser scroll restoration so refresh without hash stays at the top
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToHashOrTop = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = decodeURIComponent(hash.replace("#", ""));
        let attempts = 0;
        const maxAttempts = 25;
        const interval = setInterval(() => {
          const el = document.getElementById(id);
          if (el) {
            clearInterval(interval);
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              clearInterval(interval);
            }
          }
        }, 50);
      } else {
        // Without hash, always ensure page opens at the top
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };

    scrollToHashOrTop();

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = decodeURIComponent(hash.replace("#", ""));
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);

  return null;
}
