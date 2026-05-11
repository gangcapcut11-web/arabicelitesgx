
-- Items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('pdf','video','youtube')),
  file_path TEXT,
  youtube_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX items_section_idx ON public.items(section);
CREATE INDEX items_created_idx ON public.items(created_at DESC);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public can insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete items" ON public.items FOR DELETE USING (true);
CREATE POLICY "Public can update items" ON public.items FOR UPDATE USING (true);

-- Storage bucket for PDFs and videos (3GB = 3221225472 bytes)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('content', 'content', true, 3221225472)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 3221225472;

CREATE POLICY "Public read content" ON storage.objects FOR SELECT USING (bucket_id = 'content');
CREATE POLICY "Public upload content" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content');
CREATE POLICY "Public delete content" ON storage.objects FOR DELETE USING (bucket_id = 'content');
