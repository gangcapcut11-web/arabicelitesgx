import { Phone, GraduationCap } from "lucide-react";

export default function FounderCard() {
  return (
    <section className="relative mx-auto max-w-3xl my-16 px-4">
      <div className="relative rounded-[2rem] overflow-hidden gradient-primary p-1 shadow-glow animate-scale-in">
        <div className="rounded-[1.85rem] bg-card px-8 py-10 text-center relative overflow-hidden">
          {/* Floating decorative blobs */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary-soft blur-2xl animate-float" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-accent blur-3xl animate-float" style={{ animationDelay: "1.2s" }} />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-glow animate-float">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>

            <p className="mt-5 text-xs font-bold tracking-widest text-muted-foreground uppercase">المؤسس</p>
            <h2 className="mt-1 text-4xl font-display font-black animate-glow-text">
              <span className="shimmer-text">أسامة محمد</span>
            </h2>

            <a
              href="tel:01095777037"
              className="group mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl gradient-primary text-primary-foreground font-bold shadow-card hover:scale-105 hover:shadow-glow transition-all"
            >
              <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center animate-pulse-ring">
                <Phone className="w-4 h-4" />
              </span>
              <span dir="ltr" className="tracking-wider text-lg">01095777037</span>
            </a>

            <p className="mt-4 text-sm text-muted-foreground">للتواصل والاستفسار</p>
          </div>
        </div>
      </div>
    </section>
  );
}
