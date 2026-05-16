import { useState, useEffect, useCallback } from "react";
import { bookingService } from "@/services/bookingService";
import { useMyBookingsQuery } from "@/hooks/queries/useBookingQueries";
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
  Timer,
  RefreshCw,
  CreditCard,
  Info,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Search,
} from "lucide-react";
import ReviewModal from "@/components/modals/ReviewModal";
import ViewReviewModal from "@/components/modals/ViewReviewModal";
import BookingDetailModal from "@/components/modals/BookingDetailModal";
import PaymentModal from "@/components/modals/PaymentModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const { data: myBookingsData, isLoading: loading, refetch } = useMyBookingsQuery(currentPage, pageSize);
  
  const bookings = myBookingsData?.data || [];
  const totalPages = myBookingsData?.totalPages || 1;

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isViewReviewModalOpen, setIsViewReviewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const handleOpenReviewModal = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  }, []);

  const handleOpenViewReviewModal = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsViewReviewModalOpen(true);
  }, []);

  const handleOpenDetailModal = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  }, []);

  const handleOpenPaymentModal = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsPaymentModalOpen(true);
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    setSelectedBooking(null);
  }, []);
  const handleCloseViewReviewModal = useCallback(
    () => setIsViewReviewModalOpen(false),
    [],
  );
  const handleCloseDetailModal = useCallback(
    () => setIsDetailModalOpen(false),
    [],
  );
  const handleClosePaymentModal = useCallback(
    () => setIsPaymentModalOpen(false),
    [],
  );

  const handleCancelBooking = async (bookingId) => {
    const confirmToastId = toast.info(
      <div className="flex flex-col gap-3">
        <p className="font-medium">
          Bạn có chắc chắn muốn hủy đơn đặt sân này không?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(confirmToastId)}
          >
            Bỏ qua
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(confirmToastId);
              await executeCancelBooking(bookingId);
            }}
          >
            Hủy đơn
          </Button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      },
    );
  };

  const executeCancelBooking = async (bookingId) => {
    try {
      const response = await bookingService.cancelMyBooking(bookingId);
      if (response.success) {
        toast.success("Đã hủy đơn đặt sân thành công");
        refetch();
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi hủy đơn đặt sân");
    }
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Lịch sử đặt sân</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => refetch()}
              title="Làm mới dữ liệu"
            >
              <RefreshCw
                className={`h-4 w-4 text-muted-foreground ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <p className="text-muted-foreground mt-2">
            Quản lý các đơn đặt sân của bạn và gửi đánh giá cho chúng tôi.
          </p>
        </div>
      </div>

      {bookings?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Chưa có đơn đặt sân nào</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Bạn chưa thực hiện bất kỳ giao dịch đặt sân nào. Hãy bắt đầu ngay
              hôm nay!
            </p>
            <Button asChild className="mt-6">
              <a href="/">Đặt sân ngay</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings?.map((booking) => {
            const status =
              statusConfig[booking.bookingStatus] || statusConfig.PENDING;
            const StatusIcon = status.icon;

            // Cancellation logic (10-minute window)
            const createdAtDate = new Date(booking.createdAt);
            const diffInMinutes = (currentTime - createdAtDate) / (1000 * 60);
            const canCancel = diffInMinutes < 10;
            const timeLeft = Math.max(0, 10 - diffInMinutes);
            const minutes = Math.floor(timeLeft);
            const seconds = Math.floor((timeLeft - minutes) * 60);
            const timeLeftText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

            return (
              <Card
                key={booking.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Mã đơn: {booking.id.slice(0, 8)}...
                        </span>
                      </div>

                      <h3
                        className="text-xl font-bold mb-4 cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => navigate(`/court/${booking.courtId}`)}
                      >
                        {booking.courtName}
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span>Ngày: {booking.bookingDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock3 className="h-4 w-4 text-primary" />
                          <span>
                            Thời gian: {booking.startTime.slice(0, 5)} -{" "}
                            {booking.endTime.slice(0, 5)}
                          </span>
                        </div>
                      </div>

                      {booking.bookingStatus === "CANCELLED" &&
                        booking.cancelReason && (
                          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-100 animate-in fade-in slide-in-from-top-1">
                            <p className="text-xs font-semibold text-rose-600 uppercase tracking-tight mb-1 flex items-center gap-1">
                              <Info className="h-3 w-3" /> Lý do hủy từ hệ thống
                            </p>
                            <p className="text-sm text-rose-700 italic">
                              "{booking.cancelReason}"
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="bg-muted/30 p-6 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-border md:min-w-[200px]">
                      <div className="text-right flex flex-col items-end">
                        <p className="text-sm text-muted-foreground">
                          Tổng cộng
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {booking.totalPrice.toLocaleString()}đ
                        </p>
                        {booking.bookingStatus === "PENDING" && canCancel && (
                          <div className="mt-2 text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1">
                            <Timer className="h-3.5 w-3.5 animate-pulse" />
                            Còn lại: {timeLeftText}
                          </div>
                        )}
                        {booking.bookingStatus === "PENDING" &&
                          !canCancel &&
                          booking.paymentMethod === "CASH" && (
                            <div className="mt-2 text-xs font-medium text-emerald-600">
                              Đã xác nhận tự động
                            </div>
                          )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        {booking.paymentStatus === "PENDING" &&
                          booking.bookingStatus !== "CANCELLED" &&
                          booking.bookingStatus !== "COMPLETED" && (
                            <Button
                              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleOpenPaymentModal(booking)}
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        {booking.bookingStatus === "COMPLETED" &&
                          (booking.isReviewed ? (
                            <>
                              <Button
                                variant="outline"
                                className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() =>
                                  handleOpenViewReviewModal(booking)
                                }
                              >
                                <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                                Xem đánh giá
                              </Button>
                              {booking.reviewCreatedAt &&
                                (new Date() -
                                  new Date(booking.reviewCreatedAt)) /
                                  (1000 * 60 * 60 * 24) <
                                  7 && (
                                  <Button
                                    variant="outline"
                                    className="gap-2 text-amber-500 border-amber-200 hover:bg-amber-50"
                                    onClick={() =>
                                      handleOpenReviewModal(booking)
                                    }
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    Cập nhật
                                  </Button>
                                )}
                            </>
                          ) : (
                            <Button
                              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => handleOpenReviewModal(booking)}
                            >
                              <Star className="h-4 w-4" />
                              Đánh giá ngay
                            </Button>
                          ))}
                        {booking.bookingStatus === "PENDING" && canCancel && (
                          <Button
                            variant="outline"
                            className="text-rose-500 hover:text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Hủy đơn
                          </Button>
                        )}
                        {booking.bookingStatus === "CANCELLED" && (
                          <Button
                            variant="outline"
                            className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                            onClick={() =>
                              navigate(`/court/${booking.courtId}`)
                            }
                          >
                            <RefreshCw className="h-4 w-4" />
                            Đặt lại
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="text-primary hover:bg-primary/10"
                          onClick={() => handleOpenDetailModal(booking)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trước
          </Button>
          <div className="flex items-center gap-1 mx-4">
            <span className="text-sm font-medium">Trang {currentPage}</span>
            <span className="text-sm text-muted-foreground">
              / {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Sau
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {selectedBooking && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          booking={selectedBooking}
        />
      )}

      {selectedBooking && (
        <BookingDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          booking={selectedBooking}
        />
      )}

      {selectedBooking && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          booking={selectedBooking}
          onSuccess={() => refetch()}
        />
      )}

      {selectedBooking && (
        <ViewReviewModal
          isOpen={isViewReviewModalOpen}
          onClose={handleCloseViewReviewModal}
          booking={selectedBooking}
        />
      )}
    </div>
  );
}
