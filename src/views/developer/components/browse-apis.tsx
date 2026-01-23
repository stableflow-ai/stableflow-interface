import { ChevronRightIcon } from "./icons";

interface ApiCategoryProps {
  title: string;
  items: { text: string; href: string }[];
}

function ApiCategory({ title, items }: ApiCategoryProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-[#9FA7BA] uppercase tracking-wider mb-4">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index}>
            <a
              href={item.href}
              target="_blank"
              className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-md text-[#2B3337] hover:bg-[#F5F7FA] transition-colors group"
            >
              <span>{item.text}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRightIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrowseApis() {
  const categories = [
    {
      title: "Routing",
      items: [
        { text: "Get quote", href: "/developer/documentation#a-getallquote-recommended" },
        { text: "Execute route", href: "/developer/documentation#b-send-recommended" },
        { text: "Track transaction status", href: "/developer/documentation#c-getstatus-recommended" },
      ],
    },
    {
      title: "Economics",
      items: [
        { text: "Configure affiliate fees", href: "/developer/documentation#developer-fees" },
        { text: "Fee settlement and distribution", href: "/developer/documentation#developer-fees" },
      ],
    },
    {
      title: "Advanced",
      items: [
        { text: "Webhooks", href: "" },
        { text: "Error codes", href: "/developer/documentation#a-error-handling" },
        { text: "Limits & guarantees", href: "" },
      ],
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-[#DFE7ED]">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#2B3337] mb-10">
        Browse by capability
      </h2>

      <div className="grid md:grid-cols-3 gap-10">
        {categories.map((category, index) => (
          <ApiCategory
            key={index}
            title={category.title}
            items={category.items}
          />
        ))}
      </div>
    </section>
  );
}
