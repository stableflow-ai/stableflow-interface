export default function CheckIcon({ circleColor = "#fff" }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
    >
      <circle cx="8.5" cy="8.5" r="8.5" fill={circleColor} />
      <path
        d="M5 8L7.5 10.5L12 6"
        stroke="#444C59"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
