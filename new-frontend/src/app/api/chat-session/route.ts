import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/database.types";

// Max. počet uložení konverzace z jedné IP adresy za 10 minut
const LIMIT_PER_WINDOW = Number(process.env.CHAT_SAVE_LIMIT_PER_10_MIN ?? 120);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const messageSchema = z.object({
  type: z.enum(["Asistent", "Zákazník"]),
  role: z.enum(["assistant", "user"]),
  text: z.string().max(4000),
  time: z.string().max(20),
});

const bodySchema = z.object({
  sessionToken: z.string().regex(/^chat_[A-Za-z0-9-]{8,64}$/),
  userIdentifier: z.string().max(200),
  messages: z.array(messageSchema).min(1).max(200),
});

/**
 * Uložení přepisu konverzace s Nanobotem (zobrazuje se v administraci → Chaty).
 * Konverzace se průběžně aktualizuje (upsert), což databázová pravidla
 * anonymům nedovolí - zápis proto běží výhradně přes service role klíč
 * (SUPABASE_SERVICE_ROLE_KEY) s validací a rate limitem.
 */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná data konverzace." }, { status: 400 });
  }
  const { sessionToken, userIdentifier, messages } = parsed.data;

  if (!serviceKey) {
    console.error("Chat session save: chybí SUPABASE_SERVICE_ROLE_KEY - přepis konverzace se neuloží");
    return NextResponse.json({ error: "Ukládání konverzací není nakonfigurováno." }, { status: 503 });
  }

  const supabase = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const { data: withinLimit, error: limitError } = await supabase.rpc("check_rate_limit", {
    p_key: `chat-save:${ip}`,
    p_limit: LIMIT_PER_WINDOW,
    p_window_seconds: 600,
  });
  if (limitError) {
    console.warn("Rate limit check failed:", limitError.message);
  } else if (withinLimit === false) {
    return NextResponse.json({ error: "Příliš mnoho požadavků." }, { status: 429 });
  }

  const { error } = await supabase.from("chat_sessions").upsert(
    {
      session_token: sessionToken,
      user_identifier: userIdentifier || "Návštěvník",
      messages,
      status: "open",
      last_activity: new Date().toISOString(),
    },
    { onConflict: "session_token" }
  );

  if (error) {
    console.error("Chat session save failed:", error);
    return NextResponse.json({ error: "Konverzaci se nepodařilo uložit." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
