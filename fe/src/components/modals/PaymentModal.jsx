import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  Wallet,
  ArrowRight,
  Info
} from "lucide-react";
import PayPalRedirectButton from "@/components/payment/PayPalRedirectButton";

export default function PaymentModal({ isOpen, onClose, booking }) {
  if (!booking) return null;

  // Assuming rate 25,000 VND = 1 USD
  const paypalAmount = Math.round(booking.totalPrice / 25000);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-background/90 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Chọn phương thức thanh toán
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Tổng cộng</span>
              <span className="text-lg font-bold text-primary">
                {booking.totalPrice?.toLocaleString()}đ
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Sân: {booking.courtName} | Ngày: {booking.bookingDate}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Trực tuyến
            </p>
            
            <PayPalRedirectButton 
              amount={paypalAmount} 
              bookingId={booking.id} 
            />

            <button
              disabled
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 opacity-50 cursor-not-allowed group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-pink-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Ví MoMo</p>
                  <p className="text-[10px] text-muted-foreground">Sắp ra mắt</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
            <Info className="h-3 w-3 mt-0.5 text-primary" />
            <p>
              Sau khi thanh toán thành công, trạng thái thanh toán sẽ được cập nhật và đơn đặt sân sẽ được **Xác nhận (Confirmed)** ngay lập tức (nếu đang chờ).
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted/20 border-t flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
          >
            Hủy bỏ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
