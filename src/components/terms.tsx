import clsx from "clsx";

const Terms = (props: any) => {
  const { className } = props;

  return (
    <div className={clsx("flex justify-end items-center border border-[#EBF0F8] h-9 bg-[#FAFBFF] rounded-xl", className)}>
      <a
        href="/terms-of-service"
        className="px-1.5 md:px-3 h-full font-[SpaceGrotesk] text-md font-normal leading-[100%] text-[#444C59] hover:text-black border-r border-[#EBF0F8] duration-150 flex justify-center items-center"
      >
        Terms of Use
      </a>
      <a
        href="/privacy-policy"
        className="px-1.5 md:px-3 h-full font-[SpaceGrotesk] text-md font-normal leading-[100%] text-[#444C59] hover:text-black duration-150 flex justify-center items-center"
      >
        Privacy Policy
      </a>
    </div>
  );
};

export default Terms;
