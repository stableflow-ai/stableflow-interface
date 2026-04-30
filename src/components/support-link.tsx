import clsx from "clsx";

const LINKS = {
  support: "https://t.me/stableflowai",
} as const;

const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer nofollow",
} as const;

const SupportLink = (props: any) => {
  const { className } = props;

  return (
    <p className={clsx("mt-6 text-center text-sm font-light leading-[150%] text-[#444C59] md:mt-8", className)}>
      For chain or stablecoin integration proposals, reach out via{" "}
      <a href={LINKS.support} {...EXTERNAL_LINK_PROPS} className="font-medium text-[#6284F5] hover:underline">
        Support →
      </a>
    </p>
  );
};

export default SupportLink;
