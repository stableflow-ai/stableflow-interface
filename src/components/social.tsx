import { getStableflowLogo } from "@/utils/format/logo";
import clsx from "clsx";

const Social = (props: any) => {
  const { className } = props;

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {/* <a
        href="https://www.dapdap.net"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[73px] h-[26px] bg-no-repeat bg-center bg-[length:55px_15px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        style={{
          backgroundImage: `url(${getStableflowLogo('logo-dapdap.svg')})`
        }}
      /> */}
      <a
        href="https://x.com/0xStableFlow"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[26px] h-[26px] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        style={{
          backgroundImage: `url(${getStableflowLogo('logo-x.svg')})`
        }}
      />
      <a
        href="https://t.me/stableflowai"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[26px] h-[26px] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        style={{
          backgroundImage: `url(${getStableflowLogo('logo-telegram.svg')})`
        }}
      />
      <a
        href="https://paragraph.com/@stableflow"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[26px] h-[26px] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        style={{
          backgroundImage: `url(${getStableflowLogo('logo-paragraph.svg')})`
        }}
      />
      <a
        href="https://docs.stableflow.ai/"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="w-[26px] h-[26px] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        style={{
          backgroundImage: `url(${getStableflowLogo('logo-gitbook.svg')})`
        }}
      />
    </div>
  );
};

export default Social;
