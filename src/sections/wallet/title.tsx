export default function Title({ onClose }: any) {
  return (
    <div className="px-[20px] py-[16px] flex justify-between items-center">
      <span className="text-[18px] font-[500]">Connect Wallet</span>
      <button className="button" onClick={onClose}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <line
            x1="13.1284"
            y1="1.41421"
            x2="1.41443"
            y2="13.1282"
            stroke="#A1A699"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.97455 6.97455L1.23096 1.23096M9.84634 9.84634L13.5386 13.5386"
            stroke="#A1A699"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
