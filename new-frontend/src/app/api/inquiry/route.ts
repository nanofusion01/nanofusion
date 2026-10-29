import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { inquirySchema, buildInquiryPayload, INQUIRY_PHOTO_NAME } from "@/lib/inquiry";

// Max. počet poptávek z jedné IP adresy za 10 minut
const LIMIT_PER_WINDOW = Number(process.env.INQUIRY_LIMIT_PER_10_MIN ?? 5);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Uložení poptávky z veřejných formulářů a chatu.
 *
 * Se SUPABASE_SERVICE_ROLE_KEY zapisuje přes service role a hlídá rate limit
 * (funkce check_rate_limit, migrace 015). Pak lze anonymům úplně odebrat
 * přímý INSERT do tabulky inquiries (supabase/scripts/lock_inquiries_insert.sql)
 * a formuláře nepůjde obejít voláním Supabase API.
 * Bez klíče funguje jako dřív přes anon klíč (bez rate limitu).
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  // Honeypot - robotovi tvrdíme, že se vše povedlo
  if (typeof body.botField === "string" && body.botField.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  const parsed = inquirySchema.safeParse({ ...body, photo: undefined, botField: undefined });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  // Délkové limity - ochrana DB před obřími payloady
  const tooLong = [parsed.data.name, parsed.data.phone, parsed.data.email, parsed.data.service, parsed.data.source]
    .some((v) => (v ?? "").length > 200) || (parsed.data.message ?? "").length > 5000;
  if (tooLong) {
    return NextResponse.json({ error: "Některé pole je příliš dlouhé." }, { status: 400 });
  }

  const supabase = createClient<Database>(supabaseUrl, serviceKey || anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (serviceKey) {
    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const { data: withinLimit, error: limitError } = await supabase.rpc("check_rate_limit", {
      p_key: `inquiry:${ip}`,
      p_limit: LIMIT_PER_WINDOW,
      p_window_seconds: 600,
    });
    if (limitError) {
      console.warn("Rate limit check failed (chybí migrace 015?):", limitError.message);
    } else if (withinLimit === false) {
      return NextResponse.json(
        { error: "Odeslali jste příliš mnoho poptávek. Zkuste to prosím za pár minut, nebo nám zavolejte." },
        { status: 429 }
      );
    }
  }

  const photoName = typeof body.photoName === "string" && INQUIRY_PHOTO_NAME.test(body.photoName)
    ? body.photoName
    : null;
  const photo = photoName
    ? { name: photoName, url: `${supabaseUrl}/storage/v1/object/public/inquiries/${photoName}` }
    : undefined;

  const payload = buildInquiryPayload(parsed.data, photo);
  let { error } = await supabase.from("inquiries").insert(payload);

  // Starší DB bez sloupce original_photo_url (před migrací 014)
  if (error && photo && (error.code === "42703" || error.message?.includes("original_photo_url"))) {
    delete payload.original_photo_url;
    ({ error } = await supabase.from("inquiries").insert(payload));
  }

  if (error) {
    console.error("Inquiry insert failed:", error);
    return NextResponse.json(
      { error: "Poptávku se nepodařilo uložit. Zkuste to prosím znovu nebo nám zavolejte." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
