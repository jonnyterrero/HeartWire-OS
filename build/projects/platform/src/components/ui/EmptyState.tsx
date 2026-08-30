import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { href: string; label: string };
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-3">
      <div className="w-10 h-10 rounded-full bg-hw-sky/10 flex items-center justify-center mb-2">
        <Icon className="w-5 h-5 text-hw-sky" aria-hidden />
      </div>
      <p className="text-sm font-medium text-[color:var(--hw-text)]">{title}</p>
      {description && (
        <p className="text-xs text-[color:var(--hw-muted)] mt-1 max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-3 text-sm font-medium text-hw-sky hover:text-hw-lavender transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
