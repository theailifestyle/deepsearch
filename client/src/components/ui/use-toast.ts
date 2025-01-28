import { useEffect, useState } from "react";
import { toast } from "./toast";

export function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const handleToast = (e: CustomEvent) => {
      setToasts((prev) => [...prev, e.detail]);
    };

    const handleDismiss = (e: CustomEvent) => {
      const { toastId } = e.detail;
      if (toastId) {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      } else {
        setToasts([]);
      }
    };

    document.addEventListener("toast" as any, handleToast as any);
    document.addEventListener("toast-dismiss" as any, handleDismiss as any);

    return () => {
      document.removeEventListener("toast" as any, handleToast as any);
      document.removeEventListener("toast-dismiss" as any, handleDismiss as any);
    };
  }, []);

  return { toast, dismiss: toast.dismiss };
}