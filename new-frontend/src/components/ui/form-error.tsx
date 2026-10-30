/** Chybová hláška formuláře zobrazená přímo na stránce (místo alert()). */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      {message}
    </p>
  );
}
