import clsx from "clsx";

const Terms = (props: any) => {
  const { className } = props;

  return (
    <div className={clsx("flex justify-end px-[10px] gap-4 font-[SpaceGrotesk] text-[16px] font-[400] leading-[120%] text-black", className)}>
      <a
        href="/terms-of-service"
        className="hover:underline hover:text-[#6284F5] duration-150"
      >
        Terms of Use
      </a>
      <a
        href="/privacy-policy"
        className="hover:underline hover:text-[#6284F5] duration-150"
      >
        Privacy Policy
      </a>
    </div>
  );
};

export default Terms;
