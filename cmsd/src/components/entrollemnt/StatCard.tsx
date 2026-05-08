import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "blue" | "green" | "red" | "yellow";
  description?: string; // 👈 extra detail under value
  footer?: string; // 👈 small text at the bottom
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  description,
  footer,
}: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <Card className="p-4 w-80 flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        {/* Icon with highlight */}
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full ${colorMap[color]}`}
        >
          <Icon size={24} />
        </div>

        {/* Title + Value */}
        <div>
          <CardHeader className="p-0">
            <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </CardContent>
        </div>
      </div>

      {/* Footer (optional) */}
      {footer && <div className="text-xs text-gray-400">{footer}</div>}
    </Card>
  );
}
