import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CalendarDays, 
  Clock3, 
  User, 
  Phone, 
  CreditCard, 
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  CircleDashed,
  Info
} from "lucide-react";

const statusConfig = {
  PENDING: {
    label: "Chờ xác nhận",
    icon: CircleDashed,
    color: "text-amber-500 bg-amber-50 border-amber-200",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    icon: CheckCircle2,
    color: "text-blue-500 bg-blue-50 border-blue-200",
  },
  COMPLETED: {
    label: "Hoàn tất",
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: XCircle,
    color: "text-rose-500 bg-rose-50 border-rose-200",
  },
};

const paymentStatusConfig = {
  PENDING: { label: "Chưa thanh toán", color: "text-amber-600" },
  SUCCESS: { label: "Đã thanh toán", color: "text-emerald-600" },
  FAILED: { label: "Thanh toán thất bại", color: "text-rose-600" },
  REFUNDED: { label: "Đã hoàn tiền", color: "text-blue-600" },
};

export default function BookingDetailModal({ isOpen, onClose, booking }) {
  if (!booking) return null;

  const status = statusConfig[booking.bookingStatus] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-background/80 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <DialogHeader className="p-6 pb-0 relative">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Chi tiết đặt sân
            </DialogTitle>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Mã đơn hàng: <span className="font-mono text-primary">{booking.id}</span>
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6 relative">
          {/* Court Info Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{booking.courtName}</h3>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>Ngày: <span className="text-foreground font-medium">{booking.bookingDate}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <span>Thời gian: <span className="text-foreground font-medium">{booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Customer Info Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="h-3 w-3" />
                Khách hàng
              </div>
              <p className="text-sm font-medium">{booking.customerName || "N/A"}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Phone className="h-3 w-3" />
                Số điện thoại
              </div>
              <p className="text-sm font-medium">{booking.customerPhone || "N/A"}</p>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {booking.bookingStatus === "CANCELLED" && booking.cancelReason && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 space-y-2 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
                <Info className="h-3 w-3" />
                Lý do hủy đơn
              </div>
              <p className="text-sm font-medium text-rose-700 italic">"{booking.cancelReason}"</p>
            </div>
          )}

          {/* Payment Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Receipt className="h-3 w-3" />
              Thông tin thanh toán
            </div>
            
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Phương thức
                </span>
                <span className="font-medium">
                  {booking.paymentMethod === "PAYPAL" ? "PayPal" : "Tiền mặt"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" /> Trạng thái
                </span>
                <span className={`font-bold ${paymentStatusConfig[booking.paymentStatus]?.color || ""}`}>
                  {paymentStatusConfig[booking.paymentStatus]?.label || booking.paymentStatus}
                </span>
              </div>
              <div className="h-px bg-border/50 my-2" />
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold">Tổng thanh toán</span>
                <span className="text-xl font-black text-primary">
                  {booking.totalPrice?.toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/20 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
