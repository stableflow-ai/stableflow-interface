import clsx from "clsx";
import type { CSSProperties } from "react";

export interface SkeletonProps {
  /**
   * The shape of the skeleton
   * @default "rect"
   */
  variant?: "rect" | "circle" | "text";
  /**
   * Width of the skeleton
   */
  width?: number | string;
  /**
   * Height of the skeleton
   */
  height?: number | string;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Custom style
   */
  style?: CSSProperties;
  /**
   * Whether to show animation
   * @default true
   */
  animated?: boolean;
  /**
   * Border radius size
   * @default 4
   */
  borderRadius?: number;
}

export default function Skeleton({
  variant = "rect",
  width,
  height,
  className,
  style,
  animated = true,
  borderRadius = 4
}: SkeletonProps) {
  const baseStyles: CSSProperties = {
    width: width || (variant === "circle" ? height : "100%"),
    height: height || (variant === "circle" ? width : "1em"),
    borderRadius: variant === "circle" ? "50%" : `${borderRadius}px`,
    ...style
  };

  return (
    <div
      className={clsx(
        "bg-[#E5E7EB]",
        animated && "animate-pulse",
        variant === "text" && "rounded-[4px]",
        className
      )}
      style={baseStyles}
      aria-label="Loading"
      role="status"
    />
  );
}
