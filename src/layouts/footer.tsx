import clsx from "clsx";
import { lazy, Suspense, useEffect, useState } from "react";

const Terms = lazy(() => import("../components/terms"));
const Social = lazy(() => import("../components/social"));
const ZendeskWidget = lazy(() => import("../components/zendesk-widget"));

const Footer = (props: any) => {
  const { className, containerRef } = props;
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const updateBottomState = () => {
      const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setIsNearBottom(distanceToBottom <= 44);
    };

    updateBottomState();
    container.addEventListener("scroll", updateBottomState, { passive: true });

    return () => {
      container.removeEventListener("scroll", updateBottomState);
    };
  }, [containerRef]);

  return (
    <div className={clsx("w-full flex justify-between items-center gap-1 static md:fixed z-[11] bottom-2 py-1 pl-4 pr-2.5", className)}>
      <Suspense fallback={null}>
        <Social />
      </Suspense>
      <div className="flex justify-end items-end gap-2">
        <Suspense fallback={null}>
          <Terms />
        </Suspense>
        <Suspense fallback={null}>
          <ZendeskWidget className={clsx("fixed md:static z-12", isNearBottom ? "bottom-11" : "bottom-2")} />
        </Suspense>
      </div>
    </div>
  );
};

export default Footer;
