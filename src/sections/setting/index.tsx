import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useConfigStore } from "@/stores/use-config";

export default function Setting() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const configStore = useConfigStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="button p-[5px] duration-300 rounded-[8px] hover:bg-white hover:shadow-[0_0_4px_0_rgba(0,0,0,0.15)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="18"
          viewBox="0 0 16 18"
          fill="none"
        >
          <path
            d="M7.07812 0.3125C7.80089 -0.104697 8.69127 -0.104626 9.41406 0.3125L14.832 3.44043C15.5547 3.85782 16.0002 4.62912 16 5.46387V11.7188C16 12.5534 15.5539 13.3248 14.8311 13.7422L9.41406 16.8701C8.6913 17.2873 7.80091 17.2872 7.07812 16.8701L1.66016 13.7422C0.937331 13.3248 0.492188 12.5535 0.492188 11.7188V5.46387C0.492188 4.62933 0.937489 3.85782 1.66016 3.44043L7.07812 0.3125ZM8.21191 4.55664C6.00275 4.55664 4.21191 6.34747 4.21191 8.55664C4.21203 10.7657 6.00282 12.5566 8.21191 12.5566C10.4209 12.5565 12.2118 10.7657 12.2119 8.55664C12.2119 6.34753 10.421 4.55674 8.21191 4.55664ZM8.24609 6.30078C9.49218 6.30078 10.5027 7.31061 10.5029 8.55664C10.5029 9.80285 9.4923 10.8135 8.24609 10.8135C6.99993 10.8134 5.98926 9.80282 5.98926 8.55664C5.98946 7.31064 7.00005 6.30083 8.24609 6.30078Z"
            fill="#B3BBCE"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{
              duration: 0.2,
              ease: "easeOut"
            }}
            className="absolute top-[30px] right-0 px-[18px] py-[10px] w-[288px] bg-white shadow-[0_0_4px_0_rgba(0,0,0,0.15)] rounded-[8px] z-50"
          >
            <div className="text-[16px] font-[500]">Slippage Tolerance</div>
            <div className="flex justify-between items-center mt-[12px]">
              <input
                value={configStore.slippage}
                onChange={(ev) => {
                  const sanitizedValue = ev.target.value.replace(
                    /[^0-9.]/g,
                    ""
                  );

                  // Prevent multiple decimal points
                  const parts = sanitizedValue.split(".");
                  if (parts.length > 2) {
                    return;
                  }

                  configStore.set({ slippage: sanitizedValue });
                }}
                className="w-[94px] h-[22px] bg-transparent outline-none border-b border-[#EDF0F7] text-[#0E3616] text-[16px]"
              />
              <div className="flex items-center gap-[6px]">
                {[0.01, 0.05, 1].map((item) => (
                  <Item
                    key={item}
                    value={item}
                    isActive={item === Number(configStore.slippage)}
                    onClick={() => {
                      configStore.set({ slippage: item });
                    }}
                  />
                ))}
              </div>
            </div>
            {configStore.slippage > 1 && (
              <div className="text-[12px] text-[#FF6A19] mt-[8px]">
                You may pay high fees
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Item = ({ value, isActive, onClick }: any) => {
  return (
    <button
      className={clsx(
        "button w-[42px] h-[22px] rounded-[6px] border text-[12px]",
        isActive ? "bg-[#EDF0F7] border-[#6284F5]" : "border-[#EDF0F7] bg-white"
      )}
      onClick={onClick}
    >
      {value}%
    </button>
  );
};
