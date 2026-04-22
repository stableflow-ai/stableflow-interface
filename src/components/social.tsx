import clsx from "clsx";

const Social = (props: any) => {
  const { className } = props;

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {/* <a
        href="https://www.dapdap.net"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[73px] h-[26px] bg-[url('/logo-dapdap.svg')] bg-no-repeat bg-center bg-[length:55px_15px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
      /> */}
      <a
        href="https://x.com/0xStableFlow"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[26px] h-[26px] bg-[url('/logo-x.svg')] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
      />
      <a
        href="https://t.me/stableflowai"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[26px] h-[26px] bg-[url('/logo-telegram.svg')] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
      />
      <a
        href="https://paragraph.com/@stableflow"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[26px] h-[26px] bg-[url('/logo-paragraph.svg')] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
      />
      <a
        href="https://docs.stableflow.ai/"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[26px] h-[26px] bg-[url('/logo-gitbook.svg')] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
      />
    </div>
  );
};

export default Social;
