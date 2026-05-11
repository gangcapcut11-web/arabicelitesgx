import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SectionCard from "@/components/SectionCard";
import FounderCard from "@/components/FounderCard";
import { SECTIONS } from "@/lib/sections";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "منصّة أسامة محمد التعليمية" },
      { name: "description", content: "منصة تعليمية عربية حديثة: تقييمات، مراجعات، شروحات، حلول، تدريبات وفيديوهات." },
      { property: "og:title", content: "منصّة أسامة محمد التعليمية" },
      { property: "og:description", content: "محتوى تعليمي عربي متكامل" },
    ],
  }),
  component: Index,
});

function Index() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("items").select("section");
      if (!data) return;
      const c: Record<string, number> = {};
      for (const r of data) c[r.section] = (c[r.section] || 0) + 1;
      setCounts(c);
    })();
  }, []);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative pt-12 pb-8 px-4 overflow-hidden">
        <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-primary-soft blur-3xl opacity-60 animate-float" />
        <div className="absolute top-32 left-1/4 w-80 h-80 rounded-full bg-accent blur-3xl opacity-50 animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-primary tracking-widest animate-slide-up">منصّة تعليمية عربية</p>
          <h1 className="mt-3 text-5xl md:text-6xl font-display font-black leading-tight animate-slide-up" style={{ animationDelay: "100ms" }}>
            تعلّم بأسلوب <span className="shimmer-text">حديث وممتع</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: "200ms" }}>
            اختبارات، مراجعات، شروحات، حلول، تدريبات وفيديوهات في مكان واحد.
          </p>
        </div>
      </section>

      {/* SECTIONS */}
      <section className="px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-right mb-8">
            <h2 className="text-4xl font-display font-black">الأقسام</h2>
            <p className="mt-2 text-muted-foreground">اختر القسم المناسب لرحلتك التعليمية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTIONS.map((s, i) => (
              <SectionCard
                key={s.slug}
                slug={s.slug}
                title={s.title}
                description={s.description}
                Icon={s.icon}
                count={counts[s.slug] || 0}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      <FounderCard />
    </Layout>
  );
}
