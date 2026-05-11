import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Download, Trash2 } from "lucide-react";
import { extractYouTubeId } from "./section.$slug";
import { isAdmin } from "@/lib/admin";
import { sectionBySlug } from "@/lib/sections";

type Item = {
  id: string; section: string; title: string; description: string | null;
  kind: "pdf" | "video" | "youtube"; file_path: string | null;
  youtube_url: string | null; thumbnail_url: string | null;
};

export const Route = createFileRoute("/item/$id")({
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => { setAdmin(isAdmin()); }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
      setItem(data as Item | null);
      setLoading(false);
    })();
  }, [id]);

  const fileUrl = item?.file_path
    ? supabase.storage.from("content").getPublicUrl(item.file_path).data.publicUrl
    : null;

  async function handleDelete() {
    if (!item || !confirm("هل تريد حذف هذا العنصر؟")) return;
    if (item.file_path) await supabase.storage.from("content").remove([item.file_path]);
    await supabase.from("items").delete().eq("id", item.id);
    window.location.href = `/section/${item.section}`;
  }

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></Layout>;
  if (!item) return <Layout><div className="p-10 text-center">العنصر غير موجود</div></Layout>;

  const sec = sectionBySlug(item.section);

  return (
    <Layout>
      <section className="px-4 pt-8">
        <div className="mx-auto max-w-5xl">
          <Link to="/section/$slug" params={{ slug: item.section }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4 rotate-180" /> {sec?.title || "العودة"}
          </Link>

          <div className="rounded-3xl bg-card shadow-card overflow-hidden animate-scale-in">
            {/* Player */}
            <div className="bg-foreground/5">
              {item.kind === "youtube" && item.youtube_url ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(item.youtube_url)}?rel=0`}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : item.kind === "video" && fileUrl ? (
                <video controls preload="metadata" className="w-full max-h-[70vh] bg-black" playsInline>
                  <source src={fileUrl} />
                </video>
              ) : item.kind === "pdf" && fileUrl ? (
                <PdfViewer url={fileUrl} />
              ) : null}
            </div>

            <div className="p-6 md:p-8">
              <h1 className="text-3xl font-display font-black">{item.title}</h1>
              {item.description && <p className="mt-3 text-muted-foreground leading-relaxed">{item.description}</p>}

              <div className="mt-6 flex flex-wrap gap-3">
                {fileUrl && (
                  <>
                    <a href={fileUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-soft text-accent-foreground font-bold hover:scale-105 transition-transform">
                      <Download className="w-4 h-4" /> فتح في نافذة جديدة
                    </a>
                    <DownloadButton url={fileUrl} filename={`${item.title}${item.kind === "pdf" ? ".pdf" : ""}`} />
                  </>
                )}
                {admin && (
                  <button onClick={handleDelete} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold hover:scale-105 transition-transform">
                    <Trash2 className="w-4 h-4" /> حذف
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function PdfViewer({ url }: { url: string }) {
  // Use Google Docs viewer fallback ensures inline viewing without download prompt across mobile chrome
  return (
    <div className="w-full" style={{ height: "75vh" }}>
      <iframe
        src={`${url}#toolbar=1&navpanes=0&view=FitH`}
        title="PDF"
        className="w-full h-full"
      />
    </div>
  );
}
