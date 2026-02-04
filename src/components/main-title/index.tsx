import clsx from "clsx";

const MainTitle = (props: any) => {
  const { className, logo } = props;

  return (
    <div className={clsx("flex justify-center items-center gap-[5px] md:gap-[10px] w-full", className)}>
      <img src={logo || "/logo.svg"} alt="logo" className="w-[34px] h-[34px] md:w-[39px] md:h-[39px] object-center object-contain shrink-0" />
      <span className="text-black text-[20px] md:text-[30px] font-[500] shrink-0">Stableflow</span>
    </div>
  );
};

export default MainTitle;
