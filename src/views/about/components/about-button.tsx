import clsx from "clsx";
import type { ReactNode } from "react";
import { EXTERNAL_LINK_PROPS } from "../utils";

type AboutButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "dark" | "glass";
  className?: string;
};

const variantClassName = {
  primary: "bg-white text-black",
  dark: "bg-black text-white",
  glass: "border border-white/60 bg-white/20 text-white backdrop-blur-[5px]",
};

const AboutButton = ({ href, children, variant = "primary", className }: AboutButtonProps) => {
  return (
    <a
      href={href}
      {...EXTERNAL_LINK_PROPS}
      className={clsx(
        "inline-flex h-13 items-center justify-center gap-3 rounded-full px-7 text-lg leading-none transition-opacity duration-200 hover:opacity-80 active:opacity-80",
        variantClassName[variant],
        className,
      )}
    >
      <span>{children}</span>
      <svg className="size-4.5 shrink-0" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path d="M3 9H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M10 4L15 9L10 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
};

export default AboutButton;
