import clsx from "clsx";

interface ProgressCardProps {
  title: string;
  value: number;
  total: number;
  color?: string;
}

const colorStyles: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  cyan: "bg-cyan-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  red: "bg-red-500",
  teal: "bg-teal-500",
  emerald: "bg-emerald-500",
  gray: "bg-gray-500",
};

export function ProgressCard({ title, value, total, color = "blue" }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</p>
        </div>
        <span className="text-xs text-gray-400">{value} / {total}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={clsx("h-2 rounded-full transition-all duration-500", colorStyles[color] || "bg-blue-500")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
