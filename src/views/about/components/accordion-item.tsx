import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

type AccordionItemProps = {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
};

const AccordionItem = ({ question, answer, open, onToggle }: AccordionItemProps) => {
  return (
    <div className="border-b border-[#D7E1F1]">
      <button
        type="button"
        className="cursor-pointer flex w-full items-center justify-between gap-6 py-5 text-left text-xl font-light leading-[150%] text-black md:py-6"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span
          className={clsx(
            "relative size-4 shrink-0 text-[#9FA7BA] transition-transform duration-300",
            open && "rotate-405",
          )}
          aria-hidden
        >
          <img
            src="/about/icons/icon-plus.png"
            alt=""
            className="size-3.5 object-contain object-center"
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-xl font-light leading-[150%] text-[#6A749A]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccordionItem;
