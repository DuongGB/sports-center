import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  QrCode,
  Calendar,
  Clock,
  Trash2,
  ChevronRight,
  Eye,
  RefreshCw,
  Timer,
} from "lucide-react";
import QrModal from "@/components/modals/QrModal";
import BookingDetailModal from "@/components/modals/BookingDetailModal";
import { formatDate } from "@/utils/dateUtils";
import { bookingService } from "@/services/bookingService";

const CountdownTimer = ({ createdAt }) => {
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

      const m = Math.floor(diff / 60000)
        .toString()
        .padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000)
        .toString()
        .padStart(2, "0");
      setTimeLeft(`${m}:${s}`);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
      <Timer className="h-2.5 w-2.5" />
      {timeLeft}
    </div>
  );
};

export default function GuestBookingCart() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncRef = useRef(0);

  const loadBookings = () => {
    const saved = JSON.parse(localStorage.getItem("guestBookings") || "[]");
    setBookings(saved);
  };

  const syncWithApi = async () => {
    const saved = JSON.parse(localStorage.getItem("guestBookings") || "[]");
    if (saved.length === 0) return;

    setIsSyncing(true);
    try {
      const updated = await Promise.all(
        saved.map(async (b) => {
          try {
            // Chỉ đồng bộ các đơn còn có thể thay đổi trạng thái
            if (
              b.bookingStatus === "PENDING" ||
              b.bookingStatus === "CONFIRMED"
            ) {
              const res = await bookingService.getBookingById(b.id);
              if (res.success) {
                return {
                  ...b,
                  bookingStatus: res.data.bookingStatus,
                  paymentMethod: res.data.paymentMethod,
                  totalPrice: res.data.totalPrice,
                };
              }
            }
          } catch (e) {
            console.warn(`Could not sync booking ${b.id}`);
          }
          return b;
        }),
      );

      localStorage.setItem("guestBookings", JSON.stringify(updated));
      setBookings(updated);
      lastSyncRef.current = Date.now();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadBookings();
    syncWithApi(); // Sync once on mount

    window.addEventListener("storage", loadBookings);
    return () => window.removeEventListener("storage", loadBookings);
  }, []);

  const handleOpenChange = (open) => {
    if (open) {
      // Chỉ tự động sync nếu đã quá 30s kể từ lần sync cuối
      const now = Date.now();
      if (now - lastSyncRef.current > 30000) {
        syncWithApi();
      }
    }
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    const updated = bookings.filter((b) => b.id !== id);
    localStorage.setItem("guestBookings", JSON.stringify(updated));
    setBookings(updated);
  };

  const handleOpenQr = (e, booking) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setIsQrModalOpen(true);
  };

  const handleOpenDetail = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const formatPrice = (p) =>
    p != null ? p.toLocaleString("vi-VN") + "đ" : "N/A";

  return (
    <>
      <DropdownMenu onOpenChange={handleOpenChange} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative glass-card border-primary/20 hover:bg-primary/5"
          >
            <ShoppingCart
              className={`h-5 w-5 ${isSyncing ? "animate-pulse" : ""} text-primary`}
            />
            {bookings.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-in zoom-in">
                {bookings.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 glass-card border-primary/20 p-0 overflow-hidden"
          align="end"
        >
          <div className="p-4 bg-primary/5 border-b border-primary/10 flex justify-between items-center">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Đơn đặt sân
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">
                Lưu tạm cho khách vãng lai
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              onClick={syncWithApi}
              disabled={isSyncing}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Chưa có đơn đặt sân nào</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-muted/30 transition-colors group cursor-pointer relative"
                    onClick={() => handleOpenDetail(booking)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm text-primary line-clamp-1">
                          {booking.courtName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] uppercase tracking-tighter font-black px-1.5 py-0.5 rounded-full w-fit ${
                              booking.bookingStatus === "CONFIRMED"
                                ? "text-emerald-500 bg-emerald-500/10"
                                : booking.bookingStatus === "PENDING"
                                  ? "text-orange-500 bg-orange-500/10"
                                  : "text-rose-500 bg-rose-500/10"
                            }`}
                          >
                            {booking.bookingStatus}
                          </span>
                          {booking.bookingStatus === "PENDING" &&
                            booking.paymentMethod === "CASH" && (
                              <CountdownTimer createdAt={booking.createdAt} />
                            )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRemove(e, booking.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(booking.bookingDate).split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {booking.startTime?.substring(0, 5)} -{" "}
                          {booking.endTime?.substring(0, 5)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed">
                      <span className="text-sm font-black text-foreground">
                        {formatPrice(booking.totalPrice)}
                      </span>
                      <Button
                        size="sm"
                        variant={
                          booking.bookingStatus === "CONFIRMED"
                            ? "default"
                            : "ghost"
                        }
                        className={`h-7 text-[10px] gap-1 px-2 ${booking.bookingStatus === "PENDING" ? "text-orange-600 bg-orange-50 hover:bg-orange-100" : ""}`}
                        onClick={(e) => handleOpenQr(e, booking)}
                        disabled={booking.bookingStatus === "CANCELLED"}
                      >
                        <QrCode className="h-3 w-3" />
                        {booking.bookingStatus === "PENDING"
                          ? "Chờ duyệt"
                          : "Mã QR"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {bookings.length > 0 && (
            <div className="p-2 bg-muted/20 border-t border-border">
              <p className="text-[10px] text-center text-muted-foreground italic">
                Tự động đồng bộ khi mở giỏ hàng
              </p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        booking={selectedBooking}
      />

      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        booking={selectedBooking}
      />
    </>
  );
}
