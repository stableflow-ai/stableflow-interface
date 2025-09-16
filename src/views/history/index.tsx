import BackButton from "./back-button";
import Pending from "./pending";
import CompleteTransfers from "./complete-transfers";

export default function History() {
  return (
    <div className="w-full md:w-[680px] px-[10px] md:px-0 mx-auto pt-[72px] relative pb-[50px] md:pb-0">
      <BackButton className="absolute left-[10px] md:left-[0px] top-[72px] md:top-[72px] z-[10]" />
      <div className="relative text-center text-[20px] font-[500]">
        Transaction History
      </div>
      <Pending />
      <CompleteTransfers />
    </div>
  );
}
