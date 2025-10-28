import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

export default function NavigationMenu() {
  const location = useLocation();

  const menuItems = [
    {
      label: "Transfer",
      path: "/",
      isExternal: false
    },
    {
      label: "Developer",
      path: "#", // 稍后替换为实际的外部链接
      isExternal: true
    },
    {
      label: "Learn",
      path: "/learn-more",
      isExternal: false
    }
  ];

  return (
    <nav className="flex items-center gap-[24px] md:gap-[32px]">
      <Link to="/" className="shrink-0 flex items-center">
        <img 
          src="/logo.svg" 
          alt="StableFlow" 
          className="h-[20px] md:h-[24px] w-auto"
        />
      </Link>
      {menuItems.map((item) => {
        const isActive = item.path === "/" 
          ? location.pathname === "/" 
          : location.pathname.startsWith(item.path);

        if (item.isExternal) {
          return (
            <a
              key={item.label}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] md:text-[15px] font-[500] text-[#2B3337]/70 hover:text-[#2B3337] transition-colors duration-200"
            >
              {item.label}
            </a>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.path}
            className={clsx(
              "text-[14px] md:text-[15px] font-[500] transition-colors duration-200 relative pb-[4px]",
              isActive 
                ? "text-[#2B3337]" 
                : "text-[#2B3337]/70 hover:text-[#2B3337]"
            )}
          >
            {item.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0E3616] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
