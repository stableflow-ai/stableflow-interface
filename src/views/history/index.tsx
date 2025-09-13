import BackButton from "./back-button";
import Pending from "./pending";
import CompleteTransfers from "./complete-transfers";

export default function History() {
  return (
    <div className="w-[680px] mx-auto pt-[72px] relative">
      <BackButton className="absolute left-[0px] top-[72px] z-[10]" />
      <div className="relative text-center text-[20px] font-[500]">
        Transaction History
      </div>
      <Pending />
      <CompleteTransfers />
    </div>
  );
}
