import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, Shield, Home, Sparkles, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/lib/theme";
import { SECTIONS } from "@/lib/sections";

export default function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            aria-label="القائمة"
            className="p-2 rounded-xl hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-2xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-black text-lg shimmer-text">منصّة أسامة</span>
          </Link>

          <button
            onClick={toggle}
            aria-label="الوضع الليلي"
            className="p-2 rounded-xl hover:bg-accent transition-colors"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* SIDE DRAWER */}
      {open && (
        <div className="fixed inset-0 z-50 animate-scale-in" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-card p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-black text-xl">تنقّل سريع</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              <DrawerLink to="/" onClick={() => setOpen(false)} icon={<Home className="w-4 h-4" />} label="الرئيسية" />
              {SECTIONS.map((s) => (
                <DrawerLink
                  key={s.slug}
                  to="/section/$slug"
                  params={{ slug: s.slug }}
                  onClick={() => setOpen(false)}
                  icon={<s.icon className="w-4 h-4" />}
                  label={s.title}
                />
              ))}
              <div className="h-px bg-border my-4" />
              <DrawerLink to="/admin" onClick={() => setOpen(false)} icon={<Shield className="w-4 h-4" />} label="لوحة التحكم" />
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
          صُنع بكل ❤️ — © {new Date().getFullYear()} منصّة أسامة محمد
        </div>
      </footer>
    </div>
  );
}

function DrawerLink({ to, params, onClick, icon, label }: any) {
  return (
    <Link
      to={to}
      params={params}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-accent hover:translate-x-[-4px] transition-all font-semibold"
      activeProps={{ className: "bg-primary-soft text-accent-foreground" }}
    >
      <span className="w-8 h-8 rounded-xl gradient-soft flex items-center justify-center text-primary">{icon}</span>
      {label}
    </Link>
  );
}
