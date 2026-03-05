export default function WhoUses() {
  return (
    <div className="w-full">
      <h2 className="text-[20px] md:text-[24px] font-[700] text-[#6284F5] mb-[12px]">
        Are you a partner or developer?
      </h2>

      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] md:p-[30px]">
        <p className="text-[14px] md:text-[16px] text-[#2B3337] leading-[1.8] mb-[24px]">
          Integrate our SDK to offer institutional-grade transfer capabilities.
        </p>

        <a
          href="https://docs.stableflow.ai/developer/sdk-integration"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-[44px] px-[24px] bg-[#6284F5] text-white rounded-[8px] font-[600] text-[14px] hover:bg-[#2453f0] transition-all duration-150 shadow-[0_2px_8px_0_rgba(14,54,22,0.20)]"
        >
          View Docs for Builders
        </a>
      </div>
    </div>
  );
}
