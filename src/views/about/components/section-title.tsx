import clsx from "clsx";
import type { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  dark?: boolean;
};

const alignClassName = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const SectionTitle = ({ children, className, align = "center", dark }: SectionTitleProps) => {
  return (
    <h2
      className={clsx(
        "text-[32px] font-light leading-[120%] md:text-[42px] md:leading-none",
        dark ? "text-white" : "text-black",
        alignClassName[align],
        className,
      )}
    >
      {children}
    </h2>
  );
};

export default SectionTitle;
