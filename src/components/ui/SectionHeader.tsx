interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={`mb-8 ${isCenter ? "text-center" : "text-left"} ${className}`}>
      {eyebrow && (
        <span className="inline-block text-[12px] font-semibold uppercase tracking-widest text-orange-500 mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight text-[var(--brand-navy)] leading-tight ${isCenter ? "" : "max-w-xl"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-[15px] text-slate-500 leading-relaxed ${isCenter ? "max-w-xl mx-auto" : "max-w-lg"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
