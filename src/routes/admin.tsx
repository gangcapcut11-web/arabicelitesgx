import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Lock, Upload, Loader2, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { isAdmin, unlockAdmin, lockAdmin, ADMIN_PASSWORD } from "@/lib/admin";
import { SECTIONS } from "@/lib/sections";
import { supabase } from "@/integrations/supabase/client";
import { adminCreateUploadUrl, adminCreateItem } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — المسؤول" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => { setUnlocked(isAdmin()); }, []);

  if (!unlocked) {
    return (
      <Layout>
        <div className="px-4 py-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (unlockAdmin(pw)) setUnlocked(true);
              else setErr("كلمة المرور غير صحيحة");
            }}
            className="mx-auto max-w-md rounded-3xl bg-card shadow-card p-8 animate-scale-in text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-glow animate-pulse-ring">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-black">لوحة المسؤول</h1>
            <p className="text-sm text-muted-foreground mt-1">أدخل كلمة المرور للمتابعة</p>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(""); }}
              className="mt-6 w-full px-4 py-3 rounded-2xl bg-background border border-border text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              autoFocus
            />
            {err && <p className="mt-2 text-sm text-destructive flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" /> {err}</p>}
            <button type="submit" className="mt-5 w-full py-3 rounded-2xl gradient-primary text-primary-foreground font-bold shadow-card hover:scale-[1.02] transition-transform">
              دخول
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-10 mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-black">لوحة التحكم</h1>
          <button
            onClick={() => { lockAdmin(); setUnlocked(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-accent transition-colors text-sm font-bold"
          >
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>

        <UploadForm />
      </div>
    </Layout>
  );
}

function UploadForm() {
  const [section, setSection] = useState(SECTIONS[0].slug);
  const [kind, setKind] = useState<"pdf" | "video" | "youtube">("pdf");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const accept = kind === "pdf" ? "application/pdf" : "video/*";

  async function uploadWithRetry(path: string, blob: File, attempts = 3): Promise<string> {
    let lastErr: any;
    for (let i = 0; i < attempts; i++) {
      try {
        const { error } = await supabase.storage.from("content").upload(path, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: blob.type,
        });
        if (error) throw error;
        return path;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
    throw lastErr;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (!title.trim()) return setError("العنوان مطلوب");
    if (kind === "youtube" && !youtubeUrl.trim()) return setError("رابط يوتيوب مطلوب");
    if ((kind === "pdf" || kind === "video") && !file) return setError("الملف مطلوب");

    setBusy(true);
    try {
      let file_path: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${section}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        // Fake smooth progress (Supabase JS doesn't expose progress for direct uploads)
        const ticker = setInterval(() => setProgress((p) => Math.min(95, p + 2)), 250);
        try {
          file_path = await uploadWithRetry(path, file);
        } finally {
          clearInterval(ticker);
          setProgress(100);
        }
      }

      const { error: dbErr } = await supabase.from("items").insert({
        section, kind, title: title.trim(),
        description: description.trim() || null,
        file_path,
        youtube_url: kind === "youtube" ? youtubeUrl.trim() : null,
      });
      if (dbErr) throw dbErr;

      setSuccess(true);
      setTitle(""); setDescription(""); setYoutubeUrl(""); setFile(null);
      setTimeout(() => { setProgress(0); setSuccess(false); }, 2500);
    } catch (e: any) {
      setError(e?.message || "فشل الرفع، حاول مجددًا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-card shadow-card p-6 md:p-8 space-y-5 animate-slide-up">
      <h2 className="text-xl font-display font-black">إضافة محتوى جديد</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="القسم">
          <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-border">
            {SECTIONS.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
          </select>
        </Field>

        <Field label="النوع">
          <select value={kind} onChange={(e) => { setKind(e.target.value as any); setFile(null); }} className="w-full px-4 py-3 rounded-xl bg-background border border-border">
            <option value="pdf">ملف PDF</option>
            <option value="video">فيديو (ملف)</option>
            <option value="youtube">فيديو يوتيوب</option>
          </select>
        </Field>
      </div>

      <Field label="العنوان">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-border" />
      </Field>

      <Field label="الوصف (اختياري)">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl bg-background border border-border resize-none" />
      </Field>

      {kind === "youtube" ? (
        <Field label="رابط يوتيوب">
          <input dir="ltr" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 rounded-xl bg-background border border-border" />
        </Field>
      ) : (
        <Field label={`الملف (حتى 3 جيجا)`}>
          <label className="flex items-center justify-center gap-2 px-4 py-8 rounded-2xl border-2 border-dashed border-border cursor-pointer hover:bg-accent transition-colors">
            <Upload className="w-5 h-5 text-primary" />
            <span className="font-bold">{file ? file.name : "اضغط لاختيار الملف"}</span>
            <input type="file" accept={accept} hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          {file && <p className="mt-2 text-xs text-muted-foreground">الحجم: {(file.size / 1024 / 1024).toFixed(2)} م.ب</p>}
        </Field>
      )}

      {progress > 0 && (
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full gradient-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {error}</p>}
      {success && <p className="text-sm text-primary flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> تمّت الإضافة بنجاح</p>}

      <button disabled={busy} type="submit" className="w-full py-3 rounded-2xl gradient-primary text-primary-foreground font-bold shadow-card hover:scale-[1.01] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
        {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الرفع...</> : "إضافة"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold mb-2">{label}</span>
      {children}
    </label>
  );
}
