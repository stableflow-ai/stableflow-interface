import clsx from "clsx";
import type { ReactNode } from "react";

type HoverCardProps = {
  children: ReactNode;
  className?: string;
};

const HoverCard = ({ children, className }: HoverCardProps) => {
  return (
    <div
      className={clsx(
        "rounded-xl border border-[#F2F2F2] transition-transform duration-300 hover:scale-105",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default HoverCard;
