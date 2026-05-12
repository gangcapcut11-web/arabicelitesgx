import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_PASSWORD = "3349016";
export const BUCKET = "content";

export function assertAdmin(password: unknown) {
  if (typeof password !== "string" || password !== ADMIN_PASSWORD) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

export { supabaseAdmin };
