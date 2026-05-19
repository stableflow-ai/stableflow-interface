import { toast } from "react-toastify";
import Toast from "@/components/toast";

const TOAST_POSITION = "top-right";
const TOAST_CLASSNAME = "stableflow-toast stableflow-toast-top-right";

interface ToastParams {
  title: string;
  text?: string;
  duration?: number | false;
}

export default function useToast() {
  const success = (params: ToastParams) => {
    const { duration = 3000, ...rest } = params;

    return toast(<Toast type="success" {...rest} />, {
      position: TOAST_POSITION,
      className: TOAST_CLASSNAME,
      autoClose: duration,
    });
  };
  const fail = (params: ToastParams) => {
    const { duration = 3000, ...rest } = params;

    return toast(<Toast type="error" {...rest} />, {
      position: TOAST_POSITION,
      className: TOAST_CLASSNAME,
      autoClose: duration,
    });
  };
  const info = (params: ToastParams) => {
    const { duration = 3000, ...rest } = params;

    return toast(<Toast type="info" {...rest} />, {
      position: TOAST_POSITION,
      className: TOAST_CLASSNAME,
      autoClose: duration,
    });
  };
  const loading = (params: ToastParams) => {
    const { duration = 3000, ...rest } = params;

    return toast(<Toast type="pending" {...rest} />, {
      position: TOAST_POSITION,
      className: TOAST_CLASSNAME,
      autoClose: duration,
    });
  };
  const notice = (params: ToastParams) => {
    const { duration = 3000, ...rest } = params;

    return toast(<Toast type="notice" {...rest} />, {
      position: TOAST_POSITION,
      className: TOAST_CLASSNAME,
      autoClose: duration,
    });
  };
  return {
    success,
    fail,
    info,
    loading,
    notice,
    dismiss: toast.dismiss
  };
}

export function formatContractRejectedError(
  error: any,
  defaultMsg?: string
): string {
  if (error?.message?.includes("user rejected transaction")) {
    return "User rejected transaction";
  }
  return defaultMsg || "";
}
