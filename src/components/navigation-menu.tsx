import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

export const menuItems = [
  {
    label: "Transfer",
    path: "/",
    isExternal: false
  },
  {
    label: (
      <div className="flex items-center gap-[4px]">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.9994 5.94221C16.014 7.26524 15.7391 8.52946 15.1992 9.73733C14.4281 11.4573 12.5794 12.8636 10.8912 11.3666C9.51441 10.1465 9.25898 7.66949 7.19626 7.30689C4.46698 6.97367 4.4013 10.1612 2.61828 10.5214C0.630937 10.9281 -0.0282677 7.56168 0.000922296 6.03285C0.0301122 4.504 0.433906 2.3553 2.16098 2.3553C4.14833 2.3553 4.28211 5.38602 6.80462 5.22187C9.30279 5.05037 9.34655 1.89713 10.9788 0.547152C12.3872 -0.619077 14.0437 0.235994 14.8732 1.63988C15.6419 2.93841 15.98 4.46235 15.997 5.94221H15.9994Z" fill="currentColor" />
        </svg>
        <span>Deposit</span>
      </div>
    ),
    path: "https://deposit.stableflow.ai/",
    isExternal: true
  },
  {
    label: "Developer",
    path: "/developer",
    isExternal: false
  },
  {
    label: "Learn",
    path: "/learn-more",
    isExternal: false
  }
];

export default function NavigationMenu() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-[24px] md:gap-[32px]">
      <Link to="/" className="shrink-0 flex items-center">
        <img
          src="/logo.svg"
          alt="StableFlow"
          className="h-[20px] md:h-[24px] w-auto"
        />
      </Link>
      {menuItems.map((item, index) => {
        const isActive = item.path === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(item.path);

        if (item.isExternal) {
          return (
            <a
              key={index}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] md:text-[15px] font-[500] text-[#2B3337]/70 hover:text-[#2B3337] transition-colors duration-200 pb-[4px]"
            >
              {item.label}
            </a>
          );
        }

        return (
          <Link
            key={index}
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
