import type { Metadata } from "next";
import { ErrorState } from "@/components/layout/ErrorState";

export const metadata: Metadata = {
  title: "Stránka nenalezena | NANOfusion",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="Tuto stránku jsme nenašli"
      text="Odkaz je možná zastaralý nebo v něm je překlep. Všechny služby najdete na úvodní stránce."
    />
  );
}
