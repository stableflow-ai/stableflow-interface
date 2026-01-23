import { ExternalLinkIcon } from "./icons";

export function Footer() {
  const links = [
    { label: "API Reference", href: "#" },
    { label: "Integration Guide", href: "#" },
    { label: "GitHub", href: "#", external: true },
    { label: "Contact Support", href: "#" },
  ];

  return (
    <footer className="py-10 border-t border-[#DFE7ED]">
      <nav className="flex flex-wrap gap-x-8 gap-y-3">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
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
