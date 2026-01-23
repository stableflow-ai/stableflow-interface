import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { DocOverview } from "./components/doc-overview";
import { ApiPlayground } from "./components/api-playground";
import { BrowseApis } from "./components/browse-apis";
import { Footer } from "./components/footer";

const DeveloperPage = (props: any) => {
  const { } = props;

  return (
    <div className="min-h-screen relative">
      <div className="relative">
        <div className="max-w-5xl mx-auto px-6">
          <Header />
          <main>
            <Hero />
            <DocOverview />
            <ApiPlayground />
            <BrowseApis />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
