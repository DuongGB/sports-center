import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, CreditCard, User, Phone, Mail, BadgeCheck, XCircle, Info, ArrowRight, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";
import PayPalRedirectButton from "@/components/payment/PayPalRedirectButton";
import { useState, useEffect } from "react";

const ModalCountdown = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState("");
  
  useEffect(() => {
    const calculate = () => {
      const created = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const diff = 10 * 60 * 1000 - (now - created);
      
      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }
      
      const m = Math.floor(diff / 60000).toString().padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      setTimeLeft(`${m}:${s}`);
    };
    
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-orange-50 border border-orange-100 rounded-xl animate-pulse">
      <p className="text-[10px] uppercase font-black text-orange-700 mb-1">Thời gian giữ chỗ còn lại</p>
      <div className="text-2xl font-black text-orange-600 font-mono flex items-center gap-2">
        <Timer className="h-5 w-5" />
        {timeLeft}
      </div>
    </div>
  );
};

export default function BookingDetailModal({ isOpen, onClose, booking }) {
  if (!booking) return null;

  const formatPrice = (p) =>
    p != null ? p.toLocaleString("vi-VN") + "đ" : "N/A";

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-500/20"><BadgeCheck className="h-3 w-3" /> Đã xác nhận</span>;
      case "PENDING":
        return <span className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full text-xs font-bold border border-orange-500/20"><Info className="h-3 w-3" /> Đang chờ</span>;
      case "CANCELLED":
        return <span className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full text-xs font-bold border border-rose-500/20"><XCircle className="h-3 w-3" /> Đã hủy</span>;
      case "COMPLETED":
        return <span className="flex items-center gap-1 text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-500/20"><BadgeCheck className="h-3 w-3" /> Hoàn thành</span>;
      default:
        return <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-bold border">{status}</span>;
    }
  };

  const isPendingCash = booking.bookingStatus === "PENDING" && booking.paymentMethod === "CASH";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
        <div className="bg-primary p-6 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              Chi tiết đơn đặt sân
            </DialogTitle>
          </DialogHeader>
          <p className="text-primary-foreground/70 text-xs mt-1">Mã đơn: {booking.id}</p>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Header Info */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-foreground">{booking.courtName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> D-Sport Center Complex
              </p>
            </div>
            {getStatusBadge(booking.bookingStatus)}
          </div>

          {isPendingCash && booking.createdAt && (
            <ModalCountdown createdAt={booking.createdAt} />
          )}

          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Ngày đặt</p>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                {formatDate(booking.bookingDate).split(" ")[0]}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Khung giờ</p>
              <div className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-primary" />
                {booking.startTime?.substring(0, 5)} - {booking.endTime?.substring(0, 5)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold border-b pb-2">Thông tin khách hàng</h4>
            <div className="space-y-2">
              {booking.guestName && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground w-20">Họ tên:</span>
                  <span className="font-semibold">{booking.guestName}</span>
                </div>
              )}
              {booking.guestPhone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground w-20">SĐT:</span>
                  <span className="font-semibold">{booking.guestPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-20">Thanh toán:</span>
                <span className="font-semibold">{booking.paymentMethod === "CASH" ? "Tiền mặt" : booking.paymentMethod}</span>
              </div>
            </div>
          </div>

          {isPendingCash && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-blue-900">Thanh toán Online ngay?</p>
                  <p className="text-xs text-blue-700">Chuyển sang thanh toán Online để đơn hàng được xác nhận ngay và nhận mã QR.</p>
                </div>
              </div>
              <PayPalRedirectButton 
                amount={Math.round(booking.totalPrice / 25000)}
                bookingId={booking.id}
              />
            </div>
          )}

          <div className="pt-4 border-t flex justify-between items-center">
            <span className="font-bold text-muted-foreground text-sm">Tổng cộng</span>
            <span className="text-2xl font-black text-primary">{formatPrice(booking.totalPrice)}</span>
          </div>

          <Button onClick={onClose} variant="outline" className="w-full">Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
