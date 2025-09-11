import { motion } from "framer-motion";

const Loading = (props: Props) => {
  const { size = 18, style, className } = props;

  return (
    <div
      className={`flex justify-center items-center ${className}`}
      style={{
        height: size,
        ...style
      }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 1,
          ease: "linear",
          repeat: Infinity
        }}
      >
        <circle
          opacity="0.2"
          cx="9"
          cy="9"
          r="8"
          stroke="white"
          strokeWidth="2"
        />
        <path
          d="M1 9C1 13.4183 4.58172 17 9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
};

export default Loading;

interface Props {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}
