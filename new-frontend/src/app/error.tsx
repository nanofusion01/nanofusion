"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout/ErrorState";
import { Button } from "@/components/ui/button";

/** Neočekávaná chyba při vykreslení stránky - hlavička a patička webu zůstanou. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Chyba stránky:", error.digest ?? error.message);
  }, [error]);

  return (
    <ErrorState
      code="Jejda"
      title="Něco se pokazilo"
      text="Stránku se nepodařilo načíst. Zkuste to prosím znovu."
      action={
        <Button onClick={reset} size="lg">
          Zkusit znovu
        </Button>
      }
    />
  );
}
