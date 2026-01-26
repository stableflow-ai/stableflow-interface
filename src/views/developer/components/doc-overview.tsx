import { ArrowRightIcon } from "./icons";

interface DocColumnProps {
  title: string;
  href: string;
  items: string[];
}

function DocColumn({ title, items, href }: DocColumnProps) {
  return (
    <div
      className="group cursor-pointer p-6 -m-6 rounded-lg hover:bg-[#F5F7FA] transition-colors"
      onClick={() => {
        // window.location.href = href;
        window.open(href, '_blank');
      }}
    >
      <h3 className="text-lg font-semibold text-[#2B3337] mb-4 flex items-center gap-2">
        {title}
        <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
          <ArrowRightIcon />
        </span>
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="text-[#9FA7BA] text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const DocOverview = () => {
  const columns = [
    {
      title: "Routing",
      items: [
        "Cross-chain stablecoin routing",
        "Unified quotes across chains",
        "Exact output guarantees",
      ],
      href: "/developer/documentation#bridge-services",
    },
    {
      title: "Economics",
      items: [
        "Custom affiliate fees (bps-based)",
        "On-chain fee distribution",
        "No hidden markups",
      ],
      href: "/developer/documentation#developer-fees",
    },
    {
      title: "Integration",
      items: [
        "Simple REST API & SDKs",
        "Webhooks and error handling",
        "Integration support for partners",
      ],
      href: "/developer/documentation#core-functions-v20",
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-[#DFE7ED]">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#2B3337] mb-12">
        Explore the Stableflow documentation
      </h2>

      <div className="grid md:grid-cols-3 gap-12">
        {columns.map((column, index) => (
          <DocColumn
            key={index}
            title={column.title}
            items={column.items}
            href={column.href}
          />
        ))}
      </div>
    </section>
  );
}

export default DocOverview;
