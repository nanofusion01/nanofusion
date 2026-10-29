-- ============================================================
-- 009 — Service Gallery ("Z realizací" fotky u detailu služby)
-- Additive migration: nic stávajícího se nemaže.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.service_gallery (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id  UUID        NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    url         TEXT        NOT NULL,
    caption     TEXT,
    order_index INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_gallery_service_id
    ON public.service_gallery(service_id);

-- RLS
ALTER TABLE public.service_gallery ENABLE ROW LEVEL SECURITY;

-- Admin/editor: plný přístup
DROP POLICY IF EXISTS "admin_editor_all_service_gallery" ON public.service_gallery;
CREATE POLICY "admin_editor_all_service_gallery" ON public.service_gallery
    FOR ALL TO authenticated
    USING   (is_admin_or_editor())
    WITH CHECK (is_admin_or_editor());

-- Veřejnost: čtení všech fotek (bez přihlášení, pro veřejný web)
DROP POLICY IF EXISTS "Public can read service gallery" ON public.service_gallery;
CREATE POLICY "Public can read service gallery" ON public.service_gallery
    FOR SELECT USING (true);

DO $$ BEGIN RAISE NOTICE 'Migration 009_service_gallery applied successfully.'; END $$;
