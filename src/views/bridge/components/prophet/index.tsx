"use client";

import { useTrack } from "@/hooks/use-track";

const Prophet = () => {
  const { addProphetEntrance } = useTrack();

  return (
    <div className="mt-7.5 flex justify-center items-center">
      <a
        href="https://app.prophet.zone"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block relative w-full md:w-[495px] h-[52px] px-2.5 md:px-0 duration-150 hover:opacity-80"
        onClick={() => addProphetEntrance()}
      >
        <img
          src="/bridge/banners/prophet.png"
          alt="prophet"
          className="w-full h-full object-contain object-center shrink-0"
        />
        <button
          type="button"
          className="cursor-pointer w-20 h-6.5 rounded-md bg-black text-white text-xs font-medium flex justify-center items-center absolute right-4.5 md:right-2.5 top-1/2 -translate-y-[40%]"
        >
          Join Now
        </button>
      </a>
    </div>
  );
};

export default Prophet;
