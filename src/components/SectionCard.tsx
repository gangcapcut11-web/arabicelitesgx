import { Link } from "@tanstack/react-router";
import { ArrowLeft, type LucideIcon } from "lucide-react";

type Props = {
  slug: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  count: number;
  index?: number;
};

export default function SectionCard({ slug, title, description, Icon, count, index = 0 }: Props) {
  return (
    <Link
      to="/section/$slug"
      params={{ slug }}
      className="group relative overflow-hidden rounded-3xl bg-card shadow-card p-6 card-blob animate-slide-up hover:-translate-y-2 hover:shadow-glow transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative z-10 flex items-start justify-between">
        <span className="px-3 py-1.5 rounded-full bg-primary-soft text-xs font-bold text-accent-foreground">
          {count} عنصر
        </span>
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 animate-pulse-ring">
          <Icon className="w-7 h-7 text-primary-foreground" strokeWidth={2.4} />
        </div>
      </div>

      <div className="relative z-10 mt-12">
        <h3 className="text-2xl font-display font-black leading-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-6 flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
          تصفح
          <ArrowLeft className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
