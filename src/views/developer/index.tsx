import { lazy, Suspense } from "react";
import { Hero } from "./components/hero";
import { useMaintenanceStore } from "@/stores/use-maintenance";
import clsx from "clsx";

const DocOverview = lazy(() => import("./components/doc-overview"));
const ApiPlayground = lazy(() => import("./components/api-playground"));
const BrowseApis = lazy(() => import("./components/browse-apis"));
const Footer = lazy(() => import("./components/footer"));

const DeveloperPage = (props: any) => {
  const { } = props;

  const bannerVisible = useMaintenanceStore((s) => s.getBannerVisible());

  return (
    <div className="min-h-screen relative font-[SpaceGrotesk] leading-[120%] md:leading-[100%] font-normal">
      <div className="relative">
        <div
          className={clsx(
            "max-w-5xl mx-auto px-4 md:px-6",
            bannerVisible ? "pt-35" : "pt-30",
          )}
        >
          <main>
            <Hero />
            <Suspense fallback={null}>
              <DocOverview />
            </Suspense>
            <Suspense fallback={null}>
              <ApiPlayground />
            </Suspense>
            <Suspense fallback={null}>
              <BrowseApis />
            </Suspense>
          </main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
