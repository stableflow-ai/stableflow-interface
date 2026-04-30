import { STABLEFLOW_LOGO } from "../config";

const FlowLogo = () => {
  return (
    <div className="relative flex size-34 items-center justify-center rounded-full bg-[#E9EFF8]">
      <div className="absolute inset-5 rounded-full bg-[#D7E1F1] size-24" />
      <img src={STABLEFLOW_LOGO} alt="StableFlow" className="size-22 object-contain relative z-1" />
    </div>
  );
};

export default FlowLogo;
