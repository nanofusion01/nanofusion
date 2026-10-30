import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../lib/sanitize";

describe("HTML Sanitization (DOMPurify)", () => {
  it("returns empty string for null, undefined, or empty input", () => {
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
    expect(sanitizeHtml("")).toBe("");
  });

  it("preserves safe HTML tags and text", () => {
    const safeHtml = "<p>Dobrý den, <strong>vítejte</strong> v našem <em>magazínu</em>.</p>";
    const result = sanitizeHtml(safeHtml);
    expect(result).toBe(safeHtml);
  });

  it("strips malicious script tags", () => {
    const dirty = "<p>Text</p><script>alert('XSS Attack!')</script>";
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("alert");
    expect(cleaned).toContain("<p>Text</p>");
  });

  it("neutralizes svg onload attacks", () => {
    const dirty = "<svg/onload=alert(document.cookie)>";
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("onload");
    expect(cleaned).not.toContain("alert");
  });

  it("neutralizes javascript: URIs in links", () => {
    const dirty = '<a href="javascript:alert(1)">Klikněte zde</a>';
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("javascript:");
  });

  it("neutralizes nested and malformed script tags", () => {
    const dirty = "<scr<script>ipt>alert(1)</script>";
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("</script>");
    expect(cleaned).not.toMatch(/<script\b/i);
  });
});
