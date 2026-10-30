import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Supabase klient je v testech nahrazený - sledujeme, co by se zapsalo do DB
const db = {
  inserts: [] as { table: string; row: unknown }[],
  upserts: [] as { table: string; row: unknown }[],
  rateLimitAllows: true,
  insertError: null as null | { message: string; code?: string },
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: async () => ({ data: db.rateLimitAllows, error: null }),
    from: (table: string) => ({
      insert: async (row: unknown) => {
        db.inserts.push({ table, row });
        return { error: db.insertError };
      },
      upsert: async (row: unknown) => {
        db.upserts.push({ table, row });
        return { error: null };
      },
    }),
  }),
}));

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proj.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");

const { POST: postInquiry } = await import("../app/api/inquiry/route");
const { POST: postChat } = await import("../app/api/chat-session/route");

const req = (url: string, body: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
  });

const validInquiry = { name: "Jan Novák", phone: "777 888 999", service: "Kalkulačka", source: "Kalkulačka", message: "Plocha 100 m²" };

beforeEach(() => {
  db.inserts = [];
  db.upserts = [];
  db.rateLimitAllows = true;
  db.insertError = null;
});

describe("POST /api/inquiry", () => {
  it("uloží platnou poptávku", async () => {
    const res = await postInquiry(req("/api/inquiry", validInquiry));
    expect(res.status).toBe(200);
    expect(db.inserts).toHaveLength(1);
    expect(db.inserts[0]).toMatchObject({ table: "inquiries", row: { name: "Jan Novák", status: "new" } });
  });

  it("odmítne neúplná data a neuloží nic", async () => {
    const res = await postInquiry(req("/api/inquiry", { name: "X", service: "x", source: "Kalkulačka" }));
    expect(res.status).toBe(400);
    expect(db.inserts).toHaveLength(0);
  });

  it("odmítne neplatné JSON tělo", async () => {
    const res = await postInquiry(req("/api/inquiry", "nope"));
    expect(res.status).toBe(400);
  });

  it("robota (vyplněný honeypot) tiše ignoruje", async () => {
    const res = await postInquiry(req("/api/inquiry", { ...validInquiry, botField: "spam" }));
    expect(res.status).toBe(200);
    expect(db.inserts).toHaveLength(0);
  });

  it("vrátí 429 po překročení limitu", async () => {
    db.rateLimitAllows = false;
    const res = await postInquiry(req("/api/inquiry", validInquiry));
    expect(res.status).toBe(429);
    expect(db.inserts).toHaveLength(0);
  });

  it("URL fotky sestaví sám a ignoruje podvržený název", async () => {
    await postInquiry(req("/api/inquiry", { ...validInquiry, photoName: "inquiry_1_abc.jpg" }));
    await postInquiry(req("/api/inquiry", { ...validInquiry, photoName: "../../evil.png" }));
    expect(db.inserts[0].row).toMatchObject({
      original_photo_url: "https://proj.supabase.co/storage/v1/object/public/inquiries/inquiry_1_abc.jpg",
    });
    expect(db.inserts[1].row).not.toHaveProperty("original_photo_url");
  });

  it("odmítne příliš dlouhou zprávu", async () => {
    const res = await postInquiry(req("/api/inquiry", { ...validInquiry, message: "x".repeat(5001) }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/chat-session", () => {
  const valid = {
    sessionToken: "chat_0b1f4c6e-1111-2222-3333-444455556666",
    userIdentifier: "Návštěvník",
    messages: [{ type: "Zákazník", role: "user", text: "Dobrý den", time: "10:00:00" }],
  };

  it("uloží přepis konverzace", async () => {
    const res = await postChat(req("/api/chat-session", valid));
    expect(res.status).toBe(200);
    expect(db.upserts[0]).toMatchObject({ table: "chat_sessions", row: { session_token: valid.sessionToken } });
  });

  it("odmítne neplatný token relace i prázdnou konverzaci", async () => {
    expect((await postChat(req("/api/chat-session", { ...valid, sessionToken: "x" }))).status).toBe(400);
    expect((await postChat(req("/api/chat-session", { ...valid, messages: [] }))).status).toBe(400);
    expect(db.upserts).toHaveLength(0);
  });
});
