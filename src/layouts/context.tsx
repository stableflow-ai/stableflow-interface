import { createContext, useContext, type RefObject } from "react";

export type LayoutContextType = {
  containerRef: RefObject<HTMLDivElement | null>;
  isHomePage: boolean;
  ishistoryPage: boolean;
  isFooter2: boolean;
};

const LayoutContext = createContext<LayoutContextType>({
  containerRef: { current: null },
  isHomePage: false,
  ishistoryPage: false,
  isFooter2: false,
});

export default LayoutContext;

export const useLayoutContext = () => {
  return useContext(LayoutContext);
};
