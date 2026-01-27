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
              className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-md text-black hover:bg-white transition-colors group"
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

const BrowseApis = () => {
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
        // { text: "Fee settlement and distribution", href: "/developer/documentation#developer-fees" },
      ],
    },
    // {
    //   title: "Advanced",
    //   items: [
    //     { text: "Webhooks", href: "" },
    //     { text: "Error codes", href: "/developer/documentation#a-error-handling" },
    //     { text: "Limits & guarantees", href: "" },
    //   ],
    // },
  ];

  return (
    <section className="pt-16 md:pt-20">
      <h2 className="text-2xl font-semibold text-black leading-[100%]">
        Browse by capability
      </h2>

      <div className="grid md:grid-cols-3 gap-10 mt-6">
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

export default BrowseApis;
