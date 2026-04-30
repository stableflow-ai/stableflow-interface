import clsx from "clsx";

const Terms = (props: any) => {
  const { className } = props;

  return (
    <div className={clsx("w-full md:w-auto flex justify-start items-center gap-11 h-9", className)}>
      <a
        href="/terms-of-service"
        className="text-xs text-[#444C59] hover:text-black duration-150 font-['SpaceGrotesk'] font-normal leading-[100%]"
      >
        Terms of Use
      </a>
      <a
        href="/privacy-policy"
        className="text-xs text-[#444C59] hover:text-black duration-150 font-['SpaceGrotesk'] font-normal leading-[100%]"
      >
        Privacy Policy
      </a>
    </div>
  );
};

export default Terms;
