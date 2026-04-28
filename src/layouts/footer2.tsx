import { Link } from "react-router-dom";
import { getStableflowLogo } from "@/utils/format/logo";

interface FooterLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLinkItem[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "App", href: "/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "About", href: "/about" },
      { label: "Ecosystem", href: "/ecosystem" },
      { label: "Blog", href: "https://paragraph.com/@stableflow", external: true },
      { label: "User Docs", href: "https://docs.stableflow.ai/", external: true },
    ],
  },
  {
    title: "Developer",
    links: [
      { label: "Github", href: "https://github.com/stableflow-ai/stableflow-interface", external: true },
      { label: "Docs", href: "/developer/documentation" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "X", href: "https://x.com/0xStableFlow", external: true },
      { label: "Telegram", href: "https://t.me/stableflowai", external: true },
    ],
  },
];

const Footer2 = () => {
  return (
    <footer className="w-full bg-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 md:px-[80px] lg:px-[100px] pt-10 md:pt-[48px] pb-6 md:pb-[26px]">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-[320px]">
            <img
              src={getStableflowLogo("logo-stableflow-full.svg")}
              alt="StableFlow"
              className="w-[170px] h-auto"
            />
            <p className="mt-5 text-[14px] leading-normal font-light text-[#444C59]">
              StableFlow is an intent-based liquidity network dedicated to moving stablecoins at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-4 md:gap-x-12 lg:gap-x-[72px]">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h4 className="text-[14px] leading-normal font-medium text-[#444C59]">
                  {column.title}
                </h4>
                <div className="mt-4 grid grid-cols-3 md:flex md:flex-col gap-[10px]">
                  {column.links.map((item) => (
                    item.external ? (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] leading-normal font-light text-[#444C59] hover:text-[#000000] transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="text-[14px] leading-normal font-light text-[#444C59] hover:text-[#000000] transition-colors"
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 md:mt-[44px] md:border-t border-[#E8EAF0] pt-4 md:pt-[14px] flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-center md:text-left text-[12px] leading-normal font-light text-[#444C59]">
            © 2026 StableFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6 justify-center md:justify-start border-t md:border-t-0 border-[#E8EAF0] pt-4 md:pt-0 mt-2 md:mt-0">
            <Link to="/privacy-policy" className="text-[12px] leading-normal font-light text-[#444C59] hover:text-[#6284F5] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-[12px] leading-normal font-light text-[#444C59] hover:text-[#6284F5] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer2;
