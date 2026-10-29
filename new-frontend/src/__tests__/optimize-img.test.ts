import { describe, it, expect, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proj.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
const { optimizeImg } = await import("../lib/supabase");

describe("optimizeImg (zmenšení obrázků přes Supabase)", () => {
  it("přepíše veřejnou URL ze Storage na /render/image se šířkou", () => {
    expect(optimizeImg("https://proj.supabase.co/storage/v1/object/public/realizations/a.jpg", 600)).toBe(
      "https://proj.supabase.co/storage/v1/render/image/public/realizations/a.jpg?width=600&quality=80"
    );
  });

  it("doplní relativní cestu na Storage URL", () => {
    expect(optimizeImg("gallery/b.png", 400)).toBe(
      "https://proj.supabase.co/storage/v1/render/image/public/gallery/b.png?width=400&quality=80"
    );
  });

  it("nechá beze změny SVG, cizí domény a prázdné hodnoty", () => {
    expect(optimizeImg("https://proj.supabase.co/storage/v1/object/public/x/logo.svg")).toContain("/object/public/");
    expect(optimizeImg("https://img.youtube.com/vi/abc/0.jpg")).toBe("https://img.youtube.com/vi/abc/0.jpg");
    expect(optimizeImg(null)).toBe("");
  });

  it("omezí šířku na maximum Supabase (2500 px)", () => {
    expect(optimizeImg("gallery/c.jpg", 4000)).toContain("width=2500");
  });
});
