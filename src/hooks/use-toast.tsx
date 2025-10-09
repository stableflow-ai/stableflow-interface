import { toast } from "react-toastify";
import Toast from "@/components/toast";

export default function useToast() {
  const success = (params: any) => {
    return toast(<Toast type="success" {...params} />, {
      position: "top-right",
      className: "stableflow-toast stableflow-toast-top-right",
    });
  };
  const fail = (params: any) => {
    return toast(<Toast type="error" {...params} />, {
      position: "top-right",
      className: "stableflow-toast stableflow-toast-top-right",
    });
  };
  const info = (params: any) => {
    return toast(<Toast type="info" {...params} />, {
      position: "top-right",
      className: "stableflow-toast stableflow-toast-top-right",
    });
  };
  const loading = (params: any) => {
    return toast(<Toast type="pending" {...params} />, {
      position: "top-right",
      className: "stableflow-toast stableflow-toast-top-right",
    });
  };
  const notice = (params: any) => {
    return toast(<Toast type="notice" {...params} />, {
      position: "top-right",
      className: "stableflow-toast stableflow-toast-top-right",
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
