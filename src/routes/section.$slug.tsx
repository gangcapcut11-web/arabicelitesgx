import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { sectionBySlug } from "@/lib/sections";
import { supabase } from "@/integrations/supabase/client";
import { FileText, PlayCircle, Youtube, ArrowLeft, Loader2 } from "lucide-react";

type Item = {
  id: string; section: string; title: string; description: string | null;
  kind: "pdf" | "video" | "youtube"; file_path: string | null;
  youtube_url: string | null; thumbnail_url: string | null; created_at: string;
};

export const Route = createFileRoute("/section/$slug")({
  head: ({ params }) => {
    const s = sectionBySlug(params.slug);
    return { meta: [{ title: s ? `${s.title} — منصّة أسامة محمد` : "قسم" }] };
  },
  component: SectionPage,
});

function SectionPage() {
  const { slug } = Route.useParams();
  const section = sectionBySlug(slug);
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("items").select("*").eq("section", slug).order("created_at", { ascending: false });
      setItems((data as Item[]) || []);
    })();
  }, [slug]);

  if (!section) return <Layout><div className="p-10 text-center">القسم غير موجود</div></Layout>;
  const Icon = section.icon;

  return (
    <Layout>
      <section className="px-4 pt-10">
        <div className="mx-auto max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4 rotate-180" /> العودة
          </Link>

          <div className="flex items-center gap-4 mb-8 animate-slide-up">
            <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center shadow-glow">
              <Icon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-black">{section.title}</h1>
              <p className="text-muted-foreground">{section.description}</p>
            </div>
          </div>

          {items === null ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-card shadow-card">
              <p className="text-muted-foreground">لا يوجد محتوى بعد في هذا القسم.</p>
              <Link to="/admin" className="inline-block mt-4 px-5 py-2 rounded-xl gradient-primary text-primary-foreground font-bold">إضافة محتوى</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((it, i) => (
                <ItemCard key={it.id} item={it} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function ItemCard({ item, index }: { item: Item; index: number }) {
  const KindIcon = item.kind === "pdf" ? FileText : item.kind === "youtube" ? Youtube : PlayCircle;

  let thumb = item.thumbnail_url;
  if (!thumb && item.kind === "youtube" && item.youtube_url) {
    const id = extractYouTubeId(item.youtube_url);
    if (id) thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }

  return (
    <Link
      to="/item/$id"
      params={{ id: item.id }}
      className="group rounded-3xl overflow-hidden bg-card shadow-card hover:-translate-y-1 hover:shadow-glow transition-all animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-video gradient-soft flex items-center justify-center overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
        ) : (
          <KindIcon className="w-16 h-16 text-primary opacity-70 group-hover:scale-110 transition-transform" />
        )}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur text-xs font-bold flex items-center gap-1">
          <KindIcon className="w-3.5 h-3.5" />
          {item.kind === "pdf" ? "ملف" : "فيديو"}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
        {item.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
      </div>
    </Link>
  );
}

export function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
