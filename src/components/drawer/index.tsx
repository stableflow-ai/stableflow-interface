import useIsMobile from "@/hooks/use-is-mobile";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import DrawerTitle from "./title";

const Drawer = (props: any) => {
  const { open, onClose } = props;

  const isMobile = useIsMobile();

  const [contentOpen, setContentOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setContentOpen(true);
      document.body.classList.add("drawer-open");
      return;
    }
    setContentOpen(false);
    document.body.classList.remove("drawer-open");
  }, [open]);

  if (typeof window === "undefined") {
    return null;
  }

  return ReactDOM.createPortal((
    <AnimatePresence>
      {
        open && (
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              ease: "easeInOut",
              duration: 0.05,
              delay: open ? 0 : 0.3,
            }}
            className="fixed z-50 left-0 top-0 w-full h-full bg-black/50"
            onClick={(e) => {
              if (e.target !== e.currentTarget) {
                return;
              }
              onClose();
            }}
          />
        )
      }
      {
        contentOpen && (
          <DrawerContent
            key="drawer-content"
            isMobile={isMobile}
            {...props}
          />
        )
      }
    </AnimatePresence>
  ), document.body);
};

export default Drawer;

const DrawerContent = (props: any) => {
  const { className, open, children, isMobile, title, onClose } = props;

  return (
    <motion.div
      initial={isMobile ? { y: "100%", opacity: 0 } : { x: "100%", opacity: 0 }}
      animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
      exit={isMobile ? { y: "100%", opacity: 0 } : { x: "100%", opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: isMobile ? 20 : 30,
        duration: 0.3,
        delay: open ? 0.05 : 0,
      }}
      className={clsx("fixed z-[51] right-[unset] overflow-y-auto md:right-[10px] bottom-0 md:bottom-[unset] md:top-[10px] w-full md:w-[320px] h-[calc(100%-70px)] md:h-[calc(100%-20px)] overflow-hidden rounded-b-[0px] md:rounded-b-[16px] rounded-t-[16px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)]", className)}
    >
      <DrawerTitle
        onClose={onClose}
        className=""
      >
        {title}
      </DrawerTitle>
      {children}
    </motion.div>
  );
};
