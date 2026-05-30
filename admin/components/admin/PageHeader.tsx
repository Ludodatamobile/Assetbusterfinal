import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-5 bg-[#0f1e36] px-7 py-6 mb-1">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-bold text-[#F5A623] uppercase tracking-[1.1px] mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-black text-white tracking-tight leading-tight mb-1">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-white/55 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
          {actions}
        </div>
      )}
    </div>
  );
}