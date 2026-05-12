DROP POLICY IF EXISTS "Public can insert items" ON public.items;
DROP POLICY IF EXISTS "Public can update items" ON public.items;
DROP POLICY IF EXISTS "Public can delete items" ON public.items;
DROP POLICY IF EXISTS "Public read content" ON storage.objects;
DROP POLICY IF EXISTS "Public upload content" ON storage.objects;
DROP POLICY IF EXISTS "Public delete content" ON storage.objects;