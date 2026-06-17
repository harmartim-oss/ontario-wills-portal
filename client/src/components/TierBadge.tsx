import { Crown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface TierBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function TierBadge({ size = "md", showLabel = true }: TierBadgeProps) {
  const { data: planData } = trpc.user.getCurrentPlan.useQuery();

  const tier = planData?.plan?.type === "premium" ? "premium" : "free";
  const isFree = tier === "free";

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <Badge
      variant={isFree ? "outline" : "default"}
      className={`${sizeClasses[size]} gap-1.5 ${
        isFree
          ? "bg-background text-foreground border-border"
          : "bg-accent text-accent-foreground"
      }`}
    >
      {isFree ? (
        <Zap className={`${iconSize[size]} fill-current`} />
      ) : (
        <Crown className={`${iconSize[size]} fill-current`} />
      )}
      {showLabel && (tier === "free" ? "Free" : "Premium")}
    </Badge>
  );
}
