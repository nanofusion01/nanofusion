-- ============================================================
-- lock_inquiries_insert.sql  (jednorázově, ručně v SQL Editoru)
--
-- Odebere anonymním návštěvníkům přímý INSERT do tabulky inquiries.
-- Poptávky pak jdou uložit JEN přes API routu /api/inquiry ve new-frontend
-- (service role + rate limit), takže formuláře nejde obejít voláním
-- Supabase REST API s veřejným anon klíčem.
--
-- POŘADÍ JE DŮLEŽITÉ - spusťte až když:
--   1. je nasazená verze new-frontend s /api/inquiry,
--   2. má Vercel projekt "nanofusion" nastavený SUPABASE_SERVICE_ROLE_KEY,
--   3. proběhla migrace 015_rate_limits.sql.
-- Jinak přestanou fungovat všechny formuláře na webu.
--
-- Vrácení:  CREATE POLICY "Public can insert inquiries" ON public.inquiries
--             FOR INSERT WITH CHECK (true);
-- ============================================================

DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "public_insert_inquiries" ON public.inquiries;
