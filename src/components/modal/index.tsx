import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import useIsMobile from "@/hooks/use-is-mobile";

interface ModalProps {
  open?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  closeIcon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  closeIconClassName?: string;
  isForceNormal?: boolean;
  innerStyle?: React.CSSProperties;
  innerClassName?: string;
  isMaskClose?: boolean;
  isShowCloseIcon?: boolean;
}

const Modal: React.FC<ModalProps> = (props) => {
  const { children, ...restProps } = props;

  return ReactDOM.createPortal(
    (<ModalContent {...restProps}>{children}</ModalContent>) as any,
    document.body
  ) as unknown as React.ReactPortal;
};

export default Modal;

export const ModalContent = (props: ModalProps) => {
  const {
    open,
    onClose,
    children,
    style,
    className,
    isForceNormal,
    isMaskClose = true
  } = props;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMaskClose) return;
    if (e.target === e.currentTarget || isMobile) {
      onClose && onClose();
    }
  };

  useEffect(() => {
    if (open) {
      document.body.classList.add("drawer-open");
    }

    return () => {
      document.body.classList.remove("drawer-open");
    };
  }, [open]);

  const isMobile = useIsMobile();

  return (
    <AnimatePresence mode="wait">
      {props.open && (
        <div
          className={clsx(
            "fixed inset-0 bg-black/50 flex z-[200] w-full h-full left-0 top-0",
            (!isMobile || isForceNormal) && "items-center justify-center",
            className
          )}
          style={style}
          onClick={handleBackdropClick}
        >
          <AnimatePresence mode="wait">
            {isMobile && !isForceNormal ? (
              <motion.div
                animate={{
                  y: ["100%", 0],
                  transition: {
                    duration: 0.3
                  }
                }}
                exit={{
                  y: [0, "100%"],
                  transition: {
                    duration: 0.3
                  }
                }}
                className="w-screen absolute bottom-0 left-0 rounded-t-[20px]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {children}
              </motion.div>
            ) : (
              <motion.div
                animate={{
                  opacity: 1,
                  transition: {
                    duration: 0.3
                  }
                }}
                exit={{
                  opacity: 0
                }}
                className="w-full h-full flex justify-center items-center"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
