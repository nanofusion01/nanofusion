import { z } from "zod";
import { supabase } from "./supabase";
import type { Inserts } from "./database.types";

// Zod jinak zkouší `new Function()` (zrychlení validace), což Content-Security-
// Policy bez 'unsafe-eval' hlásí jako porušení. Validace funguje stejně i bez toho.
z.config({ jitless: true });

export const inquirySchema = z
  .object({
    name: z.string().min(2, "Zadejte prosím vaše jméno a příjmení (min. 2 znaky)"),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email("Neplatný formát e-mailu").optional().or(z.literal("")),
    service: z.string().min(1, "Vyberte službu"),
    message: z.string().optional().default(""),
    source: z.string().default("Web"),
    botField: z.string().optional(), // Honeypot
    photo: z
      .custom<File | null>(
        (val) => val === null || val === undefined || (typeof File !== "undefined" && val instanceof File),
        "Neplatný soubor"
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    const cleanPhone = (data.phone || "").replace(/[\s\-\(\)\+]/g, "");
    const hasValidPhone = cleanPhone.length >= 9;
    const hasEmail = Boolean(data.email && data.email.trim().length > 0);

    // 1. Kontaktní formulář vyžaduje jméno, telefon i e-mail
    if (data.source === "Kontaktní formulář") {
      if (!hasEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Pro kontaktní formulář je e-mail povinný",
        });
      }
      if (!hasValidPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Zadejte prosím platné telefonní číslo (min. 9 číslic)",
        });
      }
      return;
    }

    // 2. Chat umožňuje odeslat kontakt s telefonem nebo e-mailem
    if (data.source === "chat") {
      const isEmailInPhone = data.phone && data.phone.includes("@");
      if (data.phone && data.phone.trim() !== "" && data.phone !== "000000000" && !hasValidPhone && !isEmailInPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Zadejte prosím platné telefonní číslo (min. 9 číslic)",
        });
      }
      return;
    }

    // 3. Ostatní formuláře (kalkulace, konfigurátor služeb) vyžadují platný telefon
    if (!hasValidPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Zadejte prosím platné telefonní číslo (min. 9 číslic)",
      });
    }
  });

export type InquiryInput = z.infer<typeof inquirySchema>;

export interface InquiryResult {
  success: boolean;
  ignored?: boolean;
  error?: string;
}

/**
 * Odeslání zákaznické poptávky z prohlížeče: honeypot, Zod validace,
 * nahrání fotky do privátního bucketu 'inquiries' (10 MB limit) a předání
 * dat API routě /api/inquiry, která poptávku uloží.
 */
export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  // 1. Antispam honeypot: pokud robot vyplní skryté pole, tiše ignorujeme
  if (input.botField && input.botField.trim() !== "") {
    return { success: true, ignored: true };
  }

  // 2. Validační schéma přes Zod
  const validation = inquirySchema.safeParse(input);
  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
    throw new Error(errorMsg);
  }

  const data = validation.data;
  let photoName = "";

  // 3. Zpracování a upload fotografie do privátního bucketu inquiries
  if (data.photo && typeof File !== "undefined" && data.photo instanceof File) {
    if (data.photo.size > 10 * 1024 * 1024) {
      throw new Error("Fotografie je příliš velká. Maximální povolená velikost je 10 MB.");
    }
    if (!data.photo.type.startsWith("image/")) {
      throw new Error("Lze nahrávat pouze obrázkové formáty (JPEG, PNG, WebP).");
    }

    try {
      const ext = data.photo.name.split(".").pop()?.toLowerCase() || "jpg";
      photoName = `inquiry_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("inquiries")
        .upload(photoName, data.photo, { upsert: false, cacheControl: "3600" });

      if (uploadErr || !uploadData) photoName = "";
    } catch (e) {
      photoName = "";
      console.warn("Storage upload failed, continuing with inquiry submission:", e);
    }
  }

  // 4. Odeslání na vlastní API routu - zápis do DB, rate limit a finální
  // validace probíhají na serveru (viz src/app/api/inquiry/route.ts)
  const res = await fetch("/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      message: data.message,
      source: data.source,
      botField: input.botField,
      photoName: photoName || undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu nebo nám zavolejte.");
  }

  return { success: true };
}

/** Povolené názvy souborů fotek - klient nesmí podstrčit libovolnou URL. */
export const INQUIRY_PHOTO_NAME = /^inquiry_\d+_[a-z0-9]+\.(jpe?g|png|webp|heic|heif|avif)$/;

/**
 * Sestaví řádek do tabulky inquiries z validovaných dat (běží na serveru).
 */
export function buildInquiryPayload(
  data: InquiryInput,
  photo?: { name: string; url: string }
): Inserts<"inquiries"> {
  let finalMessage = (data.message || "").trim();
  if (photo) {
    finalMessage = finalMessage
      ? `${finalMessage}\nFotografie: přiložena k poptávce (${photo.name})`
      : `Fotografie: přiložena k poptávce (${photo.name})`;
  }

  let rawPhone = (data.phone || "").trim();
  let rawEmail = (data.email || "").trim();

  // Pokud je v poli phone detekován e-mail, přesuneme ho do pole email a phone vynulujeme
  if (rawPhone.includes("@") && !rawEmail) {
    rawEmail = rawPhone;
    rawPhone = "";
  }

  const payload: Inserts<"inquiries"> = {
    name: data.name.trim(),
    phone: rawPhone === "000000000" || rawPhone === "" ? null : rawPhone,
    email: rawEmail || null,
    service: data.service,
    message: finalMessage,
    source: data.source,
    status: "new",
  };
  if (photo) payload.original_photo_url = photo.url;
  return payload;
}
