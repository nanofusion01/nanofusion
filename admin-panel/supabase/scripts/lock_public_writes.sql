-- ============================================================
-- lock_public_writes.sql  (jednorázově, ručně v SQL Editoru)
--
-- Odebere anonymním návštěvníkům přímý zápis do tabulek inquiries
-- a chat_sessions. Poptávky a přepisy chatu pak jde ukládat JEN přes
-- serverové API webu (/api/inquiry, /api/chat-session) se service role
-- klíčem, validací a rate limitem - nejde je obejít voláním Supabase REST
-- API s veřejným anon klíčem.
--
-- POŘADÍ JE DŮLEŽITÉ - spusťte až když:
--   1. je nasazená verze new-frontend s /api/inquiry a /api/chat-session,
--   2. má Vercel projekt "nanofusion" nastavený SUPABASE_SERVICE_ROLE_KEY,
--   3. proběhla migrace 015_rate_limits.sql.
-- Jinak přestanou fungovat formuláře a ukládání chatu.
--
-- Čtení a správa v administraci (politiky pro admin/editor) zůstávají beze změny.
--
-- Vrácení:
--   CREATE POLICY "Public can insert inquiries" ON public.inquiries
--     FOR INSERT WITH CHECK (true);
--   (u chat_sessions obnovte původní politiky pro INSERT/UPDATE)
-- ============================================================

DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "public_insert_inquiries" ON public.inquiries;

-- chat_sessions: smazat jen politiky pro INSERT/UPDATE určené anon/public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_sessions'
      AND cmd IN ('INSERT', 'UPDATE')
      AND ('anon' = ANY (roles) OR 'public' = ANY (roles))
  LOOP
    EXECUTE format('DROP POLICY %I ON public.chat_sessions', r.policyname);
  END LOOP;
END $$;
