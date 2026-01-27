import { lazy, Suspense } from "react";
import { Hero } from "./components/hero";

const DocOverview = lazy(() => import("./components/doc-overview"));
const ApiPlayground = lazy(() => import("./components/api-playground"));
const BrowseApis = lazy(() => import("./components/browse-apis"));
const Footer = lazy(() => import("./components/footer"));

const DeveloperPage = (props: any) => {
  const { } = props;

  return (
    <div className="min-h-screen relative font-[SpaceGrotesk] leading-[120%] md:leading-[100%] font-normal">
      <div className="relative">
        <div className="max-w-5xl mx-auto px-6">
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
