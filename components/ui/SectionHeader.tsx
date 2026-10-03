"use client";

interface SectionHeaderProps {
  number: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SectionHeader({ number, title, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="section-number">{number}/</span>
        <span className="section-number opacity-30">───</span>
        <span className="section-number">{title.toUpperCase()}</span>
      </div>
      {description && (
        <p className="text-muted text-[15px] md:text-sm max-w-xl leading-relaxed">{description}</p>
      )}
    </div>
  );
}
