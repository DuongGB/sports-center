import { useState, useEffect } from "react";
import { bookingService } from "@/services/bookingService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  CircleDashed,
} from "lucide-react";
import ReviewModal from "@/components/modals/ReviewModal";
import { toast } from "react-toastify";

const statusConfig = {
  PENDING: {
    label: "Chờ xác nhận",
    icon: CircleDashed,
    color: "text-amber-500 bg-amber-50",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    icon: CheckCircle2,
    color: "text-blue-500 bg-blue-50",
  },
  COMPLETED: {
    label: "Hoàn tất",
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-50",
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: XCircle,
    color: "text-rose-500 bg-rose-50",
  },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getMyBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      toast.error(error.message || "Không thể tải danh sách đơn đặt sân");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lịch sử đặt sân</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý các đơn đặt sân của bạn và gửi đánh giá cho chúng tôi.
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Chưa có đơn đặt sân nào</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Bạn chưa thực hiện bất kỳ giao dịch đặt sân nào. Hãy bắt đầu ngay hôm nay!
            </p>
            <Button asChild className="mt-6">
              <a href="/">Đặt sân ngay</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => {
            const status = statusConfig[booking.bookingStatus] || statusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Mã đơn: {booking.id.slice(0, 8)}...
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-4">{booking.courtName}</h3>

                      <div className="grid gap-4 sm:grid-cols-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span>Ngày: {booking.bookingDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock3 className="h-4 w-4 text-primary" />
                          <span>Thời gian: {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-6 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-border md:min-w-[200px]">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Tổng cộng</p>
                        <p className="text-2xl font-bold text-primary">
                          {booking.totalPrice.toLocaleString()}đ
                        </p>
                      </div>

                      <div className="mt-4 flex gap-2">
                        {booking.bookingStatus === "COMPLETED" && (
                          booking.isReviewed ? (
                            <Button variant="outline" disabled className="gap-2">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              Đã đánh giá
                            </Button>
                          ) : (
                            <Button
                              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => handleOpenReviewModal(booking)}
                            >
                              <Star className="h-4 w-4" />
                              Đánh giá ngay
                            </Button>
                          )
                        )}
                        {booking.bookingStatus === "PENDING" && (
                          <Button variant="outline" className="text-rose-500 hover:text-rose-600 border-rose-200 hover:bg-rose-50">
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedBooking && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          booking={selectedBooking}
          onSuccess={fetchMyBookings}
        />
      )}
    </div>
  );
}
