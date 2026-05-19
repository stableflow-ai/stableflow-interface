import clsx from "clsx";
import Loading from "../loading/icon";

interface ToastProps {
  type: ToastType;
  title: string;
  text?: string;
  className?: string;
  closeToast?: () => void;
}

export default function Toast(props: ToastProps) {
  const { type, title, text, className, closeToast } = props;

  return (
    <div
      className={clsx(
        "px-2.5 py-2 flex gap-2 w-72 rounded-xl bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)] items-start md:w-72 max-md:w-[calc(100vw-32px)]",
        className
      )}
    >
      <ToastIcon type={type} />
      <div className="flex items-start justify-between grow text-[#444C59] font-[SpaceGrotesk]">
        <div className="flex flex-col gap-0.5">
          <div className="text-sm font-normal leading-normal items-center">
            {title}
          </div>
          {text && (
            <div className="text-xs font-light leading-normal">{text}</div>
          )}
        </div>
        <div
          className="translate-x-1 shrink-0 cursor-pointer"
          onClick={closeToast}
        >
          <ToastCloseIcon />
        </div>
      </div>
    </div>
  );
}

export const ToastType = {
  Success: "success",
  Error: "error",
  Info: "info",
  Pending: "pending",
  Notice: "notice",
} as const;
export type ToastType = (typeof ToastType)[keyof typeof ToastType];


function ToastIcon(props: { type: ToastType; }) {
  const { type } = props;

  if (type === ToastType.Success) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        className="shrink-0 w-4 h-4 translate-y-[3px]"
      >
        <circle cx="11" cy="11" r="11" fill="#39A156" />
        <path
          d="M6 10.8571L9.09375 14L15 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === ToastType.Error) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        className="shrink-0 w-4 h-4 translate-y-[3px]"
      >
        <circle cx="11" cy="11" r="11" fill="#FF6A8E" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.0407 8.95711C15.4312 8.56658 15.4312 7.93342 15.0407 7.54289C14.6502 7.15237 14.017 7.15237 13.6265 7.54289L11.2921 9.87733L8.95762 7.54289C8.56709 7.15237 7.93393 7.15237 7.5434 7.54289C7.15288 7.93342 7.15288 8.56658 7.5434 8.95711L9.87784 11.2915L7.54289 13.6265C7.15237 14.017 7.15237 14.6502 7.54289 15.0407C7.93342 15.4312 8.56658 15.4312 8.95711 15.0407L11.2921 12.7058L13.627 15.0407C14.0175 15.4312 14.6507 15.4312 15.0412 15.0407C15.4317 14.6502 15.4317 14.017 15.0412 13.6265L12.7063 11.2915L15.0407 8.95711Z"
          fill="white"
        />
      </svg>
    );
  }
  if (type === ToastType.Info) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 w-4 h-4 translate-y-[3px]"
      >
        <path
          d="M7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14ZM7 1.4C6.2646 1.4 5.5364 1.54485 4.85697 1.82627C4.17755 2.1077 3.56021 2.52019 3.0402 3.0402C2.52019 3.56021 2.1077 4.17755 1.82627 4.85697C1.54485 5.5364 1.4 6.2646 1.4 7C1.4 7.7354 1.54485 8.4636 1.82627 9.14303C2.1077 9.82245 2.52019 10.4398 3.0402 10.9598C3.56021 11.4798 4.17755 11.8923 4.85697 12.1737C5.5364 12.4552 6.2646 12.6 7 12.6C8.48521 12.6 9.90959 12.01 10.9598 10.9598C12.01 9.90959 12.6 8.48521 12.6 7C12.6 5.51479 12.01 4.09041 10.9598 3.0402C9.90959 1.99 8.48521 1.4 7 1.4ZM7 11.2C6.81435 11.2 6.6363 11.1263 6.50503 10.995C6.37375 10.8637 6.3 10.6857 6.3 10.5V5.6C6.3 5.50807 6.31811 5.41705 6.35328 5.33212C6.38846 5.24719 6.44002 5.17003 6.50503 5.10503C6.57003 5.04002 6.64719 4.98846 6.73212 4.95328C6.81705 4.91811 6.90807 4.9 7 4.9C7.09193 4.9 7.18295 4.91811 7.26788 4.95328C7.35281 4.98846 7.42997 5.04002 7.49498 5.10503C7.55998 5.17003 7.61154 5.24719 7.64672 5.33212C7.68189 5.41705 7.7 5.50807 7.7 5.6V10.5C7.7 10.6857 7.62625 10.8637 7.49498 10.995C7.3637 11.1263 7.18565 11.2 7 11.2ZM7 4.2C6.90592 4.20362 6.81207 4.18823 6.72408 4.15474C6.63608 4.12126 6.55575 4.07036 6.48788 4.0051C6.42001 3.93985 6.366 3.86157 6.32909 3.77496C6.29218 3.68834 6.27312 3.59517 6.27305 3.50102C6.27298 3.40687 6.29191 3.31367 6.3287 3.227C6.36549 3.14034 6.41938 3.06198 6.48716 2.99663C6.55493 2.93127 6.63519 2.88026 6.72314 2.84665C6.81109 2.81304 6.90491 2.79751 6.999 2.801C7.17995 2.80771 7.35126 2.88428 7.47694 3.01462C7.60263 3.14497 7.67292 3.31895 7.67305 3.50002C7.67318 3.68109 7.60314 3.85517 7.47764 3.98569C7.35214 4.11622 7.18094 4.19303 7 4.2Z"
          fill="#6284F5"
        />
      </svg>
    );
  }
  if (type === ToastType.Pending) {
    return (
      <Loading size={16} className="shrink-0 translate-y-[3px]" />
    );
  }
  if (type === ToastType.Notice) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="shrink-0 w-4 h-4 translate-y-[3px]"
      >
        <path
          d="M15.4125 5.32782L10.3969 8.39657C9.74373 8.79345 8.9906 9.00282 8.22498 8.9997H5.74373C3.67498 8.9997 2.02185 10.6091 2.02185 12.5684V19.6622C2.02185 21.8247 3.83123 23.5841 6.05623 23.5841H8.94998C9.72498 23.5841 10.4469 23.7841 11.1219 24.1872L15.4625 26.7528C15.775 26.9559 16.1343 27.0559 16.5469 27.0559C17.6844 27.0559 18.6156 26.1497 18.6156 25.0434V7.0372C18.6156 6.6872 18.5125 6.28095 18.3031 5.98095C17.6344 5.02782 16.3937 4.7247 15.4125 5.32782ZM28.9031 15.0341H22.7C22.1375 15.0278 21.675 15.4778 21.6656 16.0403C21.6656 16.5934 22.1312 17.0466 22.7 17.0466H28.9031C29.4719 17.0466 29.9375 16.5934 29.9375 16.0403C29.9281 15.4778 29.4656 15.0278 28.9031 15.0341ZM28.4906 23.5872L23.1125 20.5716C22.6312 20.2841 22.0062 20.4403 21.7156 20.9216C21.575 21.1466 21.5312 21.4216 21.6 21.6778C21.6687 21.9341 21.8406 22.1528 22.075 22.2778L27.4531 25.2966C27.9344 25.5841 28.5594 25.4278 28.85 24.9466C29.1625 24.4934 29.0062 23.8903 28.4906 23.5872ZM23.0625 11.5153L28.4375 8.49657C28.9562 8.19657 29.1094 7.59345 28.8 7.1372C28.4906 6.63407 27.8719 6.48407 27.4031 6.7872L22.025 9.80595C21.5093 10.1091 21.3531 10.7122 21.6625 11.1653C21.9781 11.6153 22.5968 11.8153 23.0625 11.5153Z"
          fill="#FFBF19"
        />
      </svg>
    );
  }
  return null;
}

function ToastCloseIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 w-3 h-3"
    >
      <line x1="0.5" y1="11.7929" x2="11.7929" y2="0.499999" stroke="#444C59" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0.5" y1="-0.5" x2="16.4706" y2="-0.5" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 12.499 12.5)" stroke="#444C59" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
