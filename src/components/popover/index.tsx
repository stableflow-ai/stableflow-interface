import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  type Dispatch,
  forwardRef,
  type SetStateAction,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { useDebounceFn } from "ahooks";
import useIsMobile from "@/hooks/use-is-mobile";

// Placement:
//            TopLeft         Top         TopRight
//    LeftTop ------------------------------------ RightTop
//            |                                  |
//       Left |              Trigger             | Right
//            |                                  |
// LeftBottom ------------------------------------ RightBottom
//            BottomLeft     Bottom    BottomRight
const Popover = forwardRef((props: Props, ref: any) => {
  const {
    children,
    content,
    placement = "BottomLeft",
    offset = 5,
    trigger = "Click",
    contentStyle,
    contentClassName,
    triggerContainerStyle,
    triggerContainerClassName,
    onClickBefore,
    closeDelayDuration = 300
  } = props;

  const triggerRef = useRef<any>(null);

  const isMobile = useIsMobile();

  const _trigger = useMemo(() => {
    let __trigger = trigger;
    if (isMobile && __trigger === "Hover") {
      __trigger = "Click";
    }
    return __trigger;
  }, [isMobile, trigger]);

  const [visible, setVisible] = useState(false);
  const [realVisible, setRealVisible] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const { run: closeDelay, cancel: closeCancel } = useDebounceFn(
    () => {
      setVisible(false);
      setRealVisible(false);
    },
    { wait: closeDelayDuration }
  );

  const refs: any = {
    onClose: () => {
      setVisible(false);
      setRealVisible(false);
    }
  };
  useImperativeHandle(ref, () => refs);

  return (
    <>
      <div
        ref={triggerRef}
        style={triggerContainerStyle}
        className={triggerContainerClassName}
        onClick={async (e) => {
          if (_trigger === "Hover") return;
          if (onClickBefore) {
            const isContinue = await onClickBefore(e, () => {
              setVisible(true);
            });
            if (!isContinue) return;
          }
          setVisible(true);
        }}
        onMouseEnter={() => {
          if (_trigger === "Click") return;
          closeCancel();
          setVisible(true);
        }}
        onMouseLeave={() => {
          if (_trigger === "Click") return;
          closeDelay();
        }}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <Card
            x={x}
            y={y}
            onLoaded={(elTooltip) => {
              const triggerEl = triggerRef.current;

              const {
                width: triggerW,
                height: triggerH,
                x: triggerX,
                y: triggerY
              } = triggerEl.getBoundingClientRect();

              const { width: w, height: h } = elTooltip.getBoundingClientRect();

              const triggerMiddleWidth = triggerX + triggerW / 2;
              const triggerMiddleHeight = triggerY + triggerH / 2;
              const targetMiddleWidth = triggerX + w / 2;
              const targetMiddleHeight = triggerY + h / 2;

              let targetX = 0;
              let targetY = 0;
              if (placement === "BottomRight") {
                targetX = triggerX + triggerW - w;
                targetY = triggerY + triggerH + offset;
              }
              if (placement === "Bottom") {
                targetX = triggerX - (targetMiddleWidth - triggerMiddleWidth);
                targetY = triggerY + triggerH + offset;
              }
              if (placement === "BottomLeft") {
                targetX = triggerX;
                targetY = triggerY + triggerH + offset;
              }
              if (placement === "LeftBottom") {
                targetX = triggerX - w - offset;
                targetY = triggerY - (h - triggerH);
              }
              if (placement === "Left") {
                targetX = triggerX - w - offset;
                targetY = triggerY - (targetMiddleHeight - triggerMiddleHeight);
              }
              if (placement === "LeftTop") {
                targetX = triggerX - w - offset;
                targetY = triggerY;
              }
              if (placement === "TopLeft") {
                targetX = triggerX;
                targetY = triggerY - offset - h;
              }
              if (placement === "Top") {
                targetX = triggerX - (targetMiddleWidth - triggerMiddleWidth);
                targetY = triggerY - offset - h;
              }
              if (placement === "TopRight") {
                targetX = triggerX + triggerW - w;
                targetY = triggerY - offset - h;
              }
              if (placement === "RightTop") {
                targetX = triggerX + triggerW + offset;
                targetY = triggerY;
              }
              if (placement === "Right") {
                targetX = triggerX + triggerW + offset;
                targetY = triggerY - (targetMiddleHeight - triggerMiddleHeight);
              }
              if (placement === "RightBottom") {
                targetX = triggerX + triggerW + offset;
                targetY = triggerY - (h - triggerH);
              }

              if (placement === "Center") {
                targetX = triggerX + offset * 2 + (triggerW - w) / 2;
                targetY = triggerY + offset + (triggerH - h) / 2;
              }

              // edge
              if (targetX < 0) targetX = 0;
              if (targetX > window.innerWidth - w) {
                targetX = window.innerWidth - w;
                if (["RightTop", "Right", "RightBottom"].includes(placement)) {
                  targetX = triggerX - w - offset;
                }
              }
              if (targetY < 0) targetY = 0;
              if (targetY > window.innerHeight - h) {
                targetY = window.innerHeight - h;
                if (
                  ["BottomRight", "Bottom", "BottomLeft"].includes(placement)
                ) {
                  targetY = triggerY - offset - h;
                }
              }

              setX(targetX);
              setY(targetY);
              setRealVisible(true);
            }}
            visible={realVisible}
            onClose={() => {
              setRealVisible(false);
              setVisible(false);
            }}
            style={contentStyle}
            className={contentClassName}
            setVisible={setVisible}
            closeDelay={closeDelay}
            closeCancel={closeCancel}
            trigger={_trigger}
          >
            {content}
          </Card>,
          document.body
        )}
    </>
  );
});

export default Popover;

export const PopoverPlacement = {
  Top: 0,
  Right: 1,
  Bottom: 2,
  Left: 3,
  TopLeft: 4,
  TopRight: 5,
  RightTop: 6,
  RightBottom: 7,
  BottomLeft: 8,
  BottomRight: 9,
  LeftTop: 10,
  LeftBottom: 11,
  Center: 12
} as const;

export const PopoverTrigger = {
  Click: "click",
  Hover: "hover"
} as const;

interface Props {
  children: any;
  content: any;
  placement?: keyof typeof PopoverPlacement;
  offset?: number;
  trigger?: keyof typeof PopoverTrigger;
  contentStyle?: React.CSSProperties;
  contentClassName?: string;
  triggerContainerStyle?: React.CSSProperties;
  triggerContainerClassName?: string;
  elRef?: HTMLElement;
  closeDelayDuration?: number;

  onClickBefore?(e: any, onContinue: () => void): Promise<boolean> | boolean;
}

const Card = (props: CardProps) => {
  const {
    onLoaded,
    x,
    y,
    visible,
    onClose,
    children,
    style,
    className,
    setVisible,
    closeDelay,
    closeCancel,
    trigger
  } = props;

  const cardRef = useRef<any>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    onLoaded(cardRef.current);
  }, []);

  useEffect(() => {
    if (!cardRef.current || !visible) return;

    const handleClose = (e: any) => {
      if (cardRef.current.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("click", handleClose);
    return () => {
      document.removeEventListener("click", handleClose);
    };
  }, [visible]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={`fixed z-[12] left-0 top-0 ${className}`}
        ref={cardRef}
        style={{
          left: x,
          top: y,
          visibility: visible ? "visible" : "hidden",
          ...style
        }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 15,
            duration: 1
          }
        }}
        exit={{
          opacity: 0
        }}
        initial={{
          opacity: 0
        }}
        onMouseEnter={() => {
          if (trigger === "Click") return;
          setVisible(true);
          closeCancel();
        }}
        onMouseLeave={() => {
          if (trigger === "Click") return;
          closeDelay();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

interface CardProps {
  x: number;
  y: number;
  visible: boolean;
  children: any;
  style?: React.CSSProperties;
  className?: string;
  setVisible: Dispatch<SetStateAction<boolean>>;
  closeDelay: () => void;
  closeCancel: () => void;
  trigger: keyof typeof PopoverTrigger;

  onLoaded(cardRef: any): void;
  onClose(): void;
}
