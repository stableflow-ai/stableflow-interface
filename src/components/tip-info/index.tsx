import clsx from "clsx";
import Popover from "../popover";

const TipInfo = (props: any) => {
  const { children, className, containerClassName } = props;

  return (
    <Popover
      content={(
        <div className={clsx("w-[170px] p-2 bg-white shadow-[0_0_4px_0_rgba(0,0,0,0.15)] rounded-[8px] text-[12px]", className)}>
          {children}
        </div>
      )}
      trigger="Hover"
      placement="Top"
      contentClassName="!z-[52]"
      closeDelayDuration={0}
      triggerContainerClassName={clsx("shrink-0 flex justify-center items-center", containerClassName)}
    >
      <button
        type="button"
        className="button w-[16px] h-[16px] bg-[url('/icon-info.svg')] bg-no-repeat bg-center bg-contain shrink-0"
      />
    </Popover>
  );
};

export default TipInfo;
