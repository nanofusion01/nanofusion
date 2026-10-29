import { describe, it, expect } from "vitest";
import { inquirySchema } from "../lib/inquiry";

describe("Inquiry Zod Schema & Validation", () => {
  it("passes for valid inquiry input from calculator", () => {
    const validData = {
      name: "Jan Novák",
      phone: "+420 777 123 456",
      email: "jan.novak@example.cz",
      service: "Čištění střech",
      message: "Dobrý den, potřebuji vyčistit střechu rodinného domu.",
      source: "Kalkulačka",
    };

    const result = inquirySchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Jan Novák");
      expect(result.data.phone).toBe("+420 777 123 456");
      expect(result.data.email).toBe("jan.novak@example.cz");
    }
  });

  it("passes for calculator when email is omitted or empty string", () => {
    const dataWithoutEmail = {
      name: "Petr Svoboda",
      phone: "777888999",
      email: "",
      service: "Čištění dlažeb",
      source: "Kalkulačka",
    };

    const result = inquirySchema.safeParse(dataWithoutEmail);
    expect(result.success).toBe(true);
  });

  it("fails when Contact form is missing email", () => {
    const contactWithoutEmail = {
      name: "Martin Kovář",
      phone: "+420 777 111 222",
      email: "",
      service: "Čištění fasád",
      source: "Kontaktní formulář",
    };

    const result = inquirySchema.safeParse(contactWithoutEmail);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("e-mail povinný"))).toBe(true);
    }
  });

  it("passes for Contact form when both phone and email are provided", () => {
    const validContact = {
      name: "Martin Kovář",
      phone: "+420 777 111 222",
      email: "martin@kovar.cz",
      service: "Čištění fasád",
      source: "Kontaktní formulář",
    };

    const result = inquirySchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it("passes for Chat inquiry even without phone number", () => {
    const chatInquiry = {
      name: "Zákazník z Chatu",
      phone: "",
      service: "Konzultace z chatu",
      message: "Dotaz na orientační cenu čištění 100 m² dlažby.",
      source: "chat",
    };

    const result = inquirySchema.safeParse(chatInquiry);
    expect(result.success).toBe(true);
  });

  it("passes for Chat inquiry when user provides an email (even short < 9 chars)", () => {
    const chatInquiryWithEmail = {
      name: "Zákazník z Chatu",
      phone: "",
      email: "a@b.cz", // 6 znaků
      service: "Konzultace z chatu",
      source: "chat",
    };

    const result = inquirySchema.safeParse(chatInquiryWithEmail);
    expect(result.success).toBe(true);
  });

  it("passes for Chat inquiry when user types email into phone field", () => {
    const chatWithEmailInPhone = {
      name: "Zákazník z Chatu",
      phone: "jan@seznam.cz",
      service: "Konzultace z chatu",
      source: "chat",
    };

    const result = inquirySchema.safeParse(chatWithEmailInPhone);
    expect(result.success).toBe(true);
  });

  it("fails when name is too short", () => {
    const invalidData = {
      name: "A",
      phone: "777888999",
      service: "Čištění fasád",
    };

    const result = inquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("min. 2 znaky");
    }
  });

  it("fails when phone is missing or shorter than 9 characters on standard forms", () => {
    const invalidData = {
      name: "Karel Dvořák",
      phone: "12345",
      service: "Čištění fasád",
      source: "Kalkulačka",
    };

    const result = inquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("min. 9 číslic");
    }
  });

  it("fails when email has invalid format", () => {
    const invalidData = {
      name: "Karel Dvořák",
      phone: "777123456",
      email: "not-an-email",
      service: "Čištění fasád",
    };

    const result = inquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Neplatný formát e-mailu");
    }
  });
});
