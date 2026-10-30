import { Button } from "@/components/ui/button";

/** Společný vzhled chybových stránek (404 a neočekávaná chyba). */
export function ErrorState({
  code,
  title,
  text,
  action,
}: {
  code: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24 bg-slate-50">
      <div className="max-w-xl text-center">
        <p className="text-amber-500 font-black text-6xl md:text-7xl mb-4">{code}</p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 text-lg mb-10">{text}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {action}
          <Button href="/" variant={action ? "white" : "primary"} size="lg" className={action ? "border border-gray-200" : ""}>
            Zpět na úvod
          </Button>
        </div>
        <p className="mt-8 text-gray-500">
          Nebo zavolejte:{" "}
          <a href="tel:+420774509409" className="text-amber-600 font-bold hover:text-amber-700">
            +420 774 509 409
          </a>
        </p>
      </div>
    </main>
  );
}
