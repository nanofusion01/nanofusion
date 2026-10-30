"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Poslední záchrana, když selže i samotný layout (hlavička, patička).
 * Nahrazuje celé <html>, proto je záměrně jednoduchá a bez dalších komponent.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Kritická chyba webu:", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="cs">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
        <div className="max-w-xl text-center">
          <p className="text-amber-500 font-black text-6xl mb-4">Jejda</p>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Něco se pokazilo</h1>
          <p className="text-gray-600 text-lg mb-10">
            Web se nepodařilo načíst. Zkuste to prosím znovu, nebo nám zavolejte na{" "}
            <a href="tel:+420774509409" className="text-amber-600 font-bold">
              +420 774 509 409
            </a>
            .
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 px-8 font-bold cursor-pointer"
          >
            Zkusit znovu
          </button>
        </div>
      </body>
    </html>
  );
}
