import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

/**
 * Centralized toast utility for consistent styling across the application
 */
export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message || "Có lỗi xảy ra"),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),

  /**
   * Shows a confirmation toast with Yes/No buttons
   * @param {string} message - The message to display
   * @param {function} onConfirm - Callback when user confirms
   * @param {string} confirmText - Label for confirm button
   * @param {string} cancelText - Label for cancel button
   */
  confirm: (message, onConfirm, confirmText = "Xác nhận", cancelText = "Hủy") => {
    toast.info(
      ({ closeToast }) => (
        <div className="py-1">
          <p className="text-sm font-semibold mb-4 text-foreground leading-relaxed">{message}</p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[11px] px-3 font-bold border-muted-foreground/20 hover:bg-muted"
              onClick={closeToast}
            >
              {cancelText}
            </Button>
            <Button
              size="sm"
              className="h-8 text-[11px] px-3 font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none shadow-sm transition-all active:scale-95"
              onClick={() => {
                onConfirm();
                closeToast();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      ),
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        className: "border border-border shadow-2xl bg-card",
        bodyClassName: "p-0"
      }
    );
  }
};
