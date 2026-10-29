-- ============================================================
-- 010_security_role_protection.sql
-- Komplexní bezpečnostní ochrana rolí, registrací, poptávek a storage
-- ============================================================

-- 1. Přidání chybějících sloupců do tabulky inquiries pro ukládání fotografií
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS original_photo_url TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Vytvoření a konfigurace dedikovaného storage bucketu pro zákaznické fotografie z kalkulátoru/poptávek.
-- Bucket je nastaven jako privátní (public = false) pro ochranu osobních údajů (GDPR - snímky soukromých nemovitostí zákazníků).
-- Velikost souborů je omezena na max 10 MB a povoleny jsou výhradně obrázkové formáty (prevence zneužití jako bezplatný hosting).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'inquiries',
  'inquiries',
  false,
  10485760, -- Max 10 MB na soubor
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];

-- Povolení nahrávání fotografií k poptávkám (anon i přihlášení) pouze do bucketu 'inquiries' s kontrolou přípony
DROP POLICY IF EXISTS "Public Inquiry Upload" ON storage.objects;
CREATE POLICY "Public Inquiry Upload" ON storage.objects 
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'inquiries'
    AND LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'avif')
  );

-- Ochrana GDPR: Anonymní uživatelé nemají přístup ke čtení ani výpisu cizích fotografií.
-- Číst soubory a vytvářet podepsané odkazy (signed URLs) mohou pouze oprávnění uživatelé administrace.
DROP POLICY IF EXISTS "Public Inquiry Read" ON storage.objects;
DROP POLICY IF EXISTS "Admin Inquiry Read" ON storage.objects;
CREATE POLICY "Admin Inquiry Read" ON storage.objects 
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'inquiries' 
    AND public.is_admin_or_editor()
  );

-- 3. Ochrana handle_new_user:
-- Zamezení neautorizované veřejné registrace. Pokud se pokusí registrovat anonymní uživatel (auth.role() = 'anon'),
-- trigger operaci odmítne. Uživatele může zakládat pouze administrátor ze serveru (přes service_role klíč).
-- Pokud by registrace přesto proběhla, role se VŽDY nastaví maximálně na 'editor' a nikdy nepřebírá metadata od klienta.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF auth.role() = 'anon' THEN
    RAISE EXCEPTION 'Veřejná registrace do systému je zakázána. Uživatelské účty smí zakládat pouze administrátor.';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'editor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ochrana změn rolí:
-- Trigger brání ne-administrátorům v eskalaci práv na 'admin' při INSERTu i UPDATE.
-- Při volání ze Server Actions přes service_role klíč (kde auth.uid() IS NULL) změna projde.
-- Při volání od přihlášeného běžného uživatele (auth.uid() IS NOT NULL AND NOT is_admin())
-- je změna role striktně zablokována.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
BEGIN
  -- Anonymní uživatel nesmí manipulovat s profily
  IF auth.role() = 'anon' THEN
    RAISE EXCEPTION 'Neautorizovaná operace: Anonymní uživatel nemůže upravovat profily.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Pokud uživatel bez admin práv vytváří profil, vynutíme roli editor
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() AND NEW.role = 'admin' THEN
      NEW.role := 'editor';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Pokud dochází ke změně role, zkontrolujeme práva
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      -- Běžný přihlášený uživatel (ne admin) nesmí měnit roli sobě ani nikomu jinému
      IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Neautorizovaná změna: Pouze administrátor může změnit roli uživatele.';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;

CREATE TRIGGER tr_protect_profile_role
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();
