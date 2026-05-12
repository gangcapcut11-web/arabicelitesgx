import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_PASSWORD = "3349016";
const BUCKET = "content";

function assertAdmin(password: unknown) {
  if (typeof password !== "string" || password !== ADMIN_PASSWORD) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

export const adminCreateUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; section: string; ext: string }) => {
    if (!d || typeof d !== "object") throw new Error("invalid");
    const section = String(d.section || "").replace(/[^a-z0-9_-]/gi, "");
    const ext = String(d.ext || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 8) || "bin";
    if (!section) throw new Error("section required");
    return { password: String(d.password || ""), section, ext };
  })
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const path = `${data.section}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${data.ext}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message || "failed to sign upload");
    return { path: signed.path, token: signed.token, signedUrl: signed.signedUrl };
  });

export const adminCreateItem = createServerFn({ method: "POST" })
  .inputValidator((d: {
    password: string;
    section: string;
    kind: "pdf" | "video" | "youtube";
    title: string;
    description?: string | null;
    file_path?: string | null;
    youtube_url?: string | null;
  }) => {
    if (!d || typeof d !== "object") throw new Error("invalid");
    const kind = d.kind;
    if (!["pdf", "video", "youtube"].includes(kind)) throw new Error("bad kind");
    const title = String(d.title || "").trim().slice(0, 300);
    if (!title) throw new Error("title required");
    return {
      password: String(d.password || ""),
      section: String(d.section || "").slice(0, 64),
      kind,
      title,
      description: d.description ? String(d.description).slice(0, 2000) : null,
      file_path: d.file_path ? String(d.file_path).slice(0, 500) : null,
      youtube_url: d.youtube_url ? String(d.youtube_url).slice(0, 500) : null,
    };
  })
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { password: _pw, ...row } = data;
    const { error } = await supabaseAdmin.from("items").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteItem = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => {
    if (!d?.id) throw new Error("id required");
    return { password: String(d.password || ""), id: String(d.id) };
  })
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { data: item } = await supabaseAdmin
      .from("items")
      .select("file_path")
      .eq("id", data.id)
      .maybeSingle();
    if (item?.file_path) {
      await supabaseAdmin.storage.from(BUCKET).remove([item.file_path]);
    }
    const { error } = await supabaseAdmin.from("items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
