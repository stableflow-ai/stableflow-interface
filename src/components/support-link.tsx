import clsx from "clsx";
import { useZendeskContext } from "./zendesk-widget";

const SupportLink = (props: any) => {
  const { className } = props;

  const {
    opened: isZendeskOpened,
    mounted: isZendeskMounted,
    onOpen: onZendeskOpen,
  } = useZendeskContext();

  return (
    <p className={clsx("mt-6 text-center text-sm font-light leading-[150%] text-[#444C59] md:mt-8", className)}>
      For chain or stablecoin integration proposals, reach out via{" "}
      <button
        type="button"
        className="font-medium text-[#6284F5] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          onZendeskOpen();
        }}
        disabled={!isZendeskMounted || isZendeskOpened}
      >
        Support →
      </button>
    </p>
  );
};

export default SupportLink;
