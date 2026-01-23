import { DiscordLink, GithubLink } from "../config";
import { ExternalLinkIcon } from "./icons";

export function Footer() {
  const links = [
    { label: "API Reference", href: "/developer/documentation#core-functions-v20" },
    { label: "Integration Guide", href: "/developer/documentation#api-configuration" },
    { label: "GitHub", href: GithubLink, external: true },
    { label: "Contact Support", href: DiscordLink, external: true },
  ];

  return (
    <footer className="py-10 border-t border-[#DFE7ED]">
      <nav className="flex flex-wrap gap-x-8 gap-y-3">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target="_blank"
            className="text-sm text-[#9FA7BA] hover:text-[#2B3337] transition-colors flex items-center gap-1"
          >
            {link.label}
            {link.external && <ExternalLinkIcon />}
          </a>
        ))}
      </nav>
      <p className="text-xs text-[#9FA7BA] mt-6">
        © {new Date().getFullYear()} Stableflow. All rights reserved.
      </p>
    </footer>
  );
}
