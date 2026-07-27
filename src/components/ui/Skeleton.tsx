interface SkeletonProps {
  className?: string;
  shape?: "rect" | "circle";
}

export default function Skeleton({
  className = "",
  shape = "rect",
}: SkeletonProps) {
  return (
    <div
      className={[
        "skeleton-shimmer",
        shape === "circle" ? "rounded-full" : "rounded-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
