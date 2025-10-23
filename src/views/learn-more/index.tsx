import MainTitle from "@/components/main-title";
import BackButton from "@/components/back-button";
import Hero from "./components/hero";
import HowItWorks from "./components/how-it-works";
import BuiltFor from "./components/built-for";
import Future from "./components/future";

export default function LearnMore() {
  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center mb-[100px]">
      <div className="md:w-[1100px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0 relative">
        
        <BackButton
          className="absolute translate-x-[10px] translate-y-[-5px] md:translate-y-[10px] md:translate-x-[0px]"
        />
        
        <MainTitle className="!hidden md:!flex" />
        
        <div className="px-[10px] md:px-0 mb-[40px]">
          <Hero />
        </div>

        <div className="px-[10px] md:px-0 mb-[40px]">
          <HowItWorks />
        </div>

        <div className="px-[10px] md:px-0 mb-[40px]">
          <BuiltFor />
        </div>

        <div className="px-[10px] md:px-0">
          <Future />
        </div>
      </div>
    </div>
  );
}
