import Button from "@/components/button";
import { CheckIcon } from "./icons";
import { ApplayAPIAccess } from "../config";

export function Hero() {
  return (
    <section className="pt-30">
      <div className="max-w-[1070px]">
        <p className="text-[14px] text-[#9FA7BA]">
          Developer Documentation
        </p>

        <h1 className="text-[36px] text-[#000] mt-[12px] font-[600] leading-[100%]">
          Free API. Zero platform fees.
        </h1>

        <p className="text-[16px] text-[#9FA7BA] mt-[14px]">
          You set your own affiliate fees.
        </p>

        <ul className="space-y-3 mt-[18px]">
          <li className="flex items-center gap-3 text-[#000]">
            <span className="text-[#000]">
              <CheckIcon />
            </span>
            <span>Define your own affiliate fee structure</span>
          </li>
          <li className="flex items-center gap-3 text-[#000]">
            <span className="text-[#000]">
              <CheckIcon />
            </span>
            <span>Get hands-on integration support</span>
          </li>
          <li className="flex items-center gap-3 text-[#000]">
            <span className="text-[#000]">
              <CheckIcon />
            </span>
            <span>Route across all major stablecoins and chains</span>
          </li>
        </ul>

        <div className="flex flex-wrap gap-4 mt-[20px]">
          <Button
            className="h-10 px-7 !text-sm !font-[400] bg-[#6284F5] text-white rounded-[20px]"
            isPrimary={true}
            onClick={() => {
              window.open(ApplayAPIAccess, '_blank');
            }}
          >
            Get API Access
          </Button>
          <Button
            className="h-10 px-7 !text-sm !font-[400] text-[#6284F5] border border-[#6284F5] bg-transparent hover:bg-[#6284F5] hover:text-white rounded-[20px]"
            isPrimary={false}
            onClick={() => {
              window.open('/developer/documentation', '_blank');
            }}
          >
            Read Docs
          </Button>
        </div>

        <p className="text-sm text-[#9FA7BA] mt-4">
          Non-custodial • On-chain settlement • Transparent fee routing
        </p>
      </div>
    </section>
  );
}
