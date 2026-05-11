import { ClipboardCheck, BookmarkCheck, Lightbulb, BookOpen, Dumbbell, PlayCircle, type LucideIcon } from "lucide-react";

export type SectionDef = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const SECTIONS: SectionDef[] = [
  { slug: "assessments", title: "تقييمات", description: "اختبارات وتقييمات لقياس مستواك", icon: ClipboardCheck },
  { slug: "reviews",     title: "مراجعات نهائية", description: "ملخصات سريعة قبل الاختبار", icon: BookmarkCheck },
  { slug: "explanations",title: "شرح", description: "شروحات مبسطة لكل درس", icon: BookOpen },
  { slug: "solutions",   title: "حل", description: "حلول نموذجية مفصّلة", icon: Lightbulb },
  { slug: "exercises",   title: "تدريبات", description: "تمارين متنوعة لتقوية مستواك", icon: Dumbbell },
  { slug: "videos",      title: "فيديوهات", description: "دروس مرئية وشرح بالفيديو", icon: PlayCircle },
];

export const sectionBySlug = (slug: string) => SECTIONS.find((s) => s.slug === slug);
