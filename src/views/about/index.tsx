import { lazy, Suspense, type ComponentType, type LazyExoticComponent, useRef } from "react";
import { motion, useInView } from "framer-motion";
import HeroBanner from "./sections/hero-banner";
import SolverFlow from "./sections/solver-flow";

const SmartRouting = lazy(() => import("./sections/smart-routing"));
const CompetitiveSize = lazy(() => import("./sections/competitive-size"));
const SecureDesign = lazy(() => import("./sections/secure-design"));
const HowItWorks = lazy(() => import("./sections/how-it-works"));
const TrustedBy = lazy(() => import("./sections/trusted-by"));
const FAQ = lazy(() => import("./sections/faq"));
const Developers = lazy(() => import("./sections/developers"));
const Resources = lazy(() => import("./sections/resources"));

type LazySectionProps = {
  Component: LazyExoticComponent<ComponentType>;
};

const LazySection = ({ Component }: LazySectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25, margin: "0px 0px -12% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Suspense fallback={<div className="min-h-[320px] w-full" />}>
        <Component />
      </Suspense>
    </motion.div>
  );
};

const About = () => {
  return (
    <div className="w-full min-h-screen overflow-x-hidden pt-22 pb-10 font-[SpaceGrotesk]">
      <HeroBanner />
      <SolverFlow />
      <LazySection Component={SmartRouting} />
      <LazySection Component={CompetitiveSize} />
      <LazySection Component={SecureDesign} />
      <LazySection Component={HowItWorks} />
      <LazySection Component={TrustedBy} />
      <LazySection Component={FAQ} />
      <LazySection Component={Developers} />
      <LazySection Component={Resources} />
    </div>
  );
};

export default About;
