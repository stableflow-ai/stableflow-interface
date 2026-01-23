import Button from "@/components/button";
import { CheckIcon } from "./icons";
import { ApplayAPIAccess } from "../config";

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="text-xs font-medium tracking-widest text-[#9FA7BA] uppercase mb-4">
          Developer Documentation
        </p>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[#2B3337] mb-3">
          Free API. Zero platform fees.
        </h1>
        
        <p className="text-xl md:text-2xl text-[#9FA7BA] mb-8">
          You set your own affiliate fees.
        </p>
        
        <ul className="space-y-3 mb-10">
          <li className="flex items-center gap-3 text-[#2B3337]">
            <span className="text-[#9FA7BA]">
              <CheckIcon />
            </span>
            <span>Define your own affiliate fee structure</span>
          </li>
          <li className="flex items-center gap-3 text-[#2B3337]">
            <span className="text-[#9FA7BA]">
              <CheckIcon />
            </span>
            <span>Get hands-on integration support</span>
          </li>
          <li className="flex items-center gap-3 text-[#2B3337]">
            <span className="text-[#9FA7BA]">
              <CheckIcon />
            </span>
            <span>Route across all major stablecoins and chains</span>
          </li>
        </ul>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            className="h-10 px-6 text-sm font-medium bg-[#2B3337] text-white"
            isPrimary={true}
            onClick={() => {
              window.open(ApplayAPIAccess, '_blank');
            }}
          >
            Get API Access
          </Button>
          <Button
            className="h-10 px-6 text-sm font-medium border border-[#DFE7ED] bg-transparent hover:bg-[#F5F7FA]"
            isPrimary={false}
            onClick={() => {
              window.open('/developer/documentation', '_blank');
            }}
          >
            Read the Docs
          </Button>
        </div>
        
        <p className="text-sm text-[#9FA7BA]">
          Non-custodial • On-chain settlement • Transparent fee routing
        </p>
      </div>
    </section>
  );
}
