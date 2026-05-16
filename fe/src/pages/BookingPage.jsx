import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCourtQuery } from "@/hooks/queries/useCourtQueries";
import { useActiveEventsQuery } from "@/hooks/queries/useEventQueries";
import { bookingService } from "@/services/bookingService";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  Loader2,
} from "lucide-react";
import PayPalButton from "@/components/payment/PayPalButton";
import PayPalRedirectButton from "@/components/payment/PayPalRedirectButton";

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courtId = searchParams.get("courtId");
  const { user, isAuthenticated } = useAuth();

  const { data: court, isLoading: loadingCourt } = useCourtQuery(courtId);
  const { data: activeEvents = [] } = useActiveEventsQuery();
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    let timer;
    if (bookingSuccess && bookingSuccess.paymentMethod === "CASH" && bookingSuccess.bookingStatus === "PENDING" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bookingSuccess, timeLeft]);

  const formatTimeLeft = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCancelMyBooking = async () => {
    const confirmToastId = toast.info(
      <div className="flex flex-col gap-3">
        <p className="font-medium">Bạn có chắc chắn muốn hủy đơn đặt sân này không?</p>
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
              await executeCancelBooking();
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
      }
    );
  };

  const executeCancelBooking = async () => {
    try {
      const response = await bookingService.cancelMyBooking(bookingSuccess.id);
      if (response.success) {
        toast.success("Đã hủy đơn đặt sân thành công");
        setBookingSuccess(null);
        setIsPaid(false);
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi hủy đơn đặt sân");
    }
  };



  const [formData, setFormData] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    paymentMethod: "CASH",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
  });

  // Pre-fill guest info from logged-in user
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        guestName: user.fullName || "",
        guestPhone: user.phone || "",
        guestEmail: user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courtId) {
      toast.error("Vui lòng chọn sân trước khi đặt");
      return;
    }
    if (!formData.bookingDate || !formData.startTime || !formData.endTime) {
      toast.error("Vui lòng nhập đầy đủ ngày và giờ đặt sân");
      return;
    }
    if (!isAuthenticated && (!formData.guestName || !formData.guestPhone)) {
      toast.error("Vui lòng nhập tên và số điện thoại");
      return;
    }
    if (!isAuthenticated && formData.paymentMethod === "PAYPAL" && !formData.guestEmail) {
      toast.error("Vui lòng nhập email khi chọn thanh toán qua PayPal");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        courtId,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        paymentMethod: formData.paymentMethod,
      };

      // Add guest info if not logged in
      if (!isAuthenticated) {
        payload.guestName = formData.guestName;
        payload.guestPhone = formData.guestPhone;
        payload.guestEmail = formData.guestEmail || null;
      }

      const res = await bookingService.createBooking(payload);
      if (res.success) {
        setBookingSuccess(res.data);
        setTimeLeft(600);
        toast.success("Đặt sân thành công!");
      } else {
        toast.error(res.message || "Đặt sân thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra khi đặt sân");
    } finally {
      setSubmitting(false);
    }
  };

  const timeToDecimal = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };

  const calculateTotalPrice = () => {
    if (!court || !formData.startTime || !formData.endTime) return { total: 0, original: 0, discount: 0 };

    const start = timeToDecimal(formData.startTime);
    const end = timeToDecimal(formData.endTime);

    if (end <= start) return { total: 0, original: 0, discount: 0 };

    let totalOriginal = 0;
    let totalDiscounted = 0;
    let isBlocked = false;

    // Check if entire period is blocked by any event
    activeEvents.forEach(event => {
      if (event.type === "BLOCK_BOOKING") {
        const applies = event.scope === "ALL_COURTS" || event.targets?.some(target => 
          target.courtId === court.id || target.sportTypeId === court.sportTypeId
        );
        if (applies) {
          // Check date-time overlap
          const eventStart = new Date(event.startDatetime).getTime();
          const eventEnd = new Date(event.endDatetime).getTime();
          const bookingStart = new Date(`${formData.bookingDate}T${formData.startTime}`).getTime();
          const bookingEnd = new Date(`${formData.bookingDate}T${formData.endTime}`).getTime();

          if (bookingStart < eventEnd && bookingEnd > eventStart) {
            isBlocked = true;
          }
        }
      }
    });

    // Iterate through every 30-minute interval
    for (let current = start; current < end; current += 0.5) {
      const currentPriceObj = court.prices?.find((p) => {
        const pStart = timeToDecimal(p.startTime);
        const pEnd = timeToDecimal(p.endTime);
        return current >= pStart && current < pEnd;
      });

      if (currentPriceObj) {
        const originalPriceSlot = currentPriceObj.price * 0.5;
        totalOriginal += originalPriceSlot;

        // Apply best discount
        let bestDiscountedPrice = originalPriceSlot;
        activeEvents.forEach(event => {
          if (event.type === "BLOCK_BOOKING") return;

          const applies = event.scope === "ALL_COURTS" || event.targets?.some(target => 
            target.courtId === court.id || target.sportTypeId === court.sportTypeId
          );

          if (applies) {
            let discounted = originalPriceSlot;
            if (event.type === "DISCOUNT_PERCENT") {
              discounted = originalPriceSlot * (1 - event.discountPercent / 100);
            } else if (event.type === "DISCOUNT_FIXED") {
              discounted = originalPriceSlot - (event.discountAmount / 2);
            }
            if (discounted < bestDiscountedPrice) bestDiscountedPrice = Math.max(0, discounted);
          }
        });
        totalDiscounted += bestDiscountedPrice;
      }
    }
    return { 
      total: Math.round(totalDiscounted), 
      original: totalOriginal, 
      discount: totalOriginal - totalDiscounted,
      isBlocked
    };
  };

  const pricing = calculateTotalPrice();
  const totalPrice = pricing.total;


  const formatPrice = (p) =>
    p != null ? p.toLocaleString("vi-VN") + "đ" : "N/A";

  const formatTime24h = (time) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  if (loadingCourt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải thông tin sân...</span>
      </div>
    );
  }

  // Success screen
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/60 shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Đặt sân thành công!</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Sân:</strong> {bookingSuccess.courtName}
              </p>
              <p>
                <strong>Ngày:</strong> {bookingSuccess.bookingDate}
              </p>
              <p>
                <strong>Giờ:</strong> {bookingSuccess.startTime?.substring(0, 5)} -{" "}
                {bookingSuccess.endTime?.substring(0, 5)}
              </p>
              <p>
                <strong>Tổng tiền:</strong>{" "}
                {formatPrice(bookingSuccess.totalPrice)}
              </p>
              <p>
                <strong>Trạng thái đơn:</strong>{" "}
                <span className={`px-2 py-0.5 text-xs rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-800 font-medium dark:bg-orange-900/30 dark:text-orange-400'}`}>
                  {isPaid ? 'Đã thanh toán' : 'Chờ xác nhận/Thanh toán'}
                </span>
              </p>
              {bookingSuccess.paymentMethod === "CASH" && timeLeft > 0 && (
                <p className="text-rose-600 dark:text-rose-400 font-medium animate-pulse mt-2">
                  Giữ chỗ trong: {formatTimeLeft(timeLeft)}
                </p>
              )}
              {bookingSuccess.paymentMethod === "CASH" && timeLeft <= 0 && (
                <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                  Đơn đã được tự động xác nhận.
                </p>
              )}
            </div>

            {/* PayPal Section */}
            {bookingSuccess.paymentMethod === "PAYPAL" && !isPaid && (
              <div className="pt-4 space-y-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Vui lòng thanh toán qua PayPal để hoàn tất:</p>
                <PayPalRedirectButton 
                  amount={Math.round(bookingSuccess.totalPrice / 25000)} // Giả sử tỷ giá 25k/USD
                  bookingId={bookingSuccess.id}
                />
              </div>
            )}

            <div className="pt-4 flex flex-col gap-2">
              <Button onClick={() => navigate("/")} className="w-full">
                Về trang chủ
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBookingSuccess(null);
                  setIsPaid(false);
                  setFormData((prev) => ({
                    ...prev,
                    bookingDate: "",
                    startTime: "",
                    endTime: "",
                  }));
                }}
                className="w-full"
              >
                Đặt thêm sân
              </Button>
              {bookingSuccess.paymentMethod === "CASH" && timeLeft > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleCancelMyBooking}
                  className="w-full"
                >
                  Hủy đặt sân
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Button>

        <h1 className="text-3xl font-bold tracking-tight mb-8">Đặt sân thể thao</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          {/* Court Info */}
          <div className="space-y-6">
            {court ? (
              <Card className="border-border/60 overflow-hidden">
                {court.courtImages && court.courtImages.length > 0 && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={court.courtImages[0]}
                      alt={court.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{court.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {court.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    <span>
                      Giờ mở cửa: {court.openTime?.substring(0, 5)} -{" "}
                      {court.closeTime?.substring(0, 5)}
                    </span>
                  </div>

                  {/* Hourly prices moved here */}
                  {court.prices && court.prices.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <span className="w-1 h-4 bg-primary rounded-full" />
                        Bảng giá theo khung giờ:
                      </p>
                      <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border">
                              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Khung giờ</th>
                              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Đơn giá</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {court.prices.map((p, idx) => {
                               const discountInfo = activeEvents.find(ev => 
                                 ev.scope === "ALL_COURTS" || ev.targets?.some(t => t.courtId === court.id || t.sportTypeId === court.sportTypeId)
                               );
                               const hasDiscount = discountInfo && (discountInfo.type === 'DISCOUNT_PERCENT' || discountInfo.type === 'DISCOUNT_FIXED');
                               let discountedPrice = p.price;
                               if (hasDiscount) {
                                 if (discountInfo.type === 'DISCOUNT_PERCENT') discountedPrice = p.price * (1 - discountInfo.discountPercent / 100);
                                 else discountedPrice = Math.max(0, p.price - discountInfo.discountAmount);
                               }

                               return (
                                 <tr key={idx} className="hover:bg-primary/5 transition-colors">
                                   <td className="px-3 py-2 text-foreground font-medium">
                                     {formatTime24h(p.startTime)} - {formatTime24h(p.endTime)}
                                   </td>
                                   <td className="px-3 py-2 text-right">
                                     {hasDiscount ? (
                                       <div className="flex flex-col items-end">
                                         <span className="text-[10px] text-muted-foreground line-through">{formatPrice(p.price)}</span>
                                         <span className="text-primary font-bold">{formatPrice(discountedPrice)}/giờ</span>
                                       </div>
                                     ) : (
                                       <span className="text-primary font-bold">{formatPrice(p.price)}/giờ</span>
                                     )}
                                   </td>
                                 </tr>
                               );
                             })}

                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Loại sân: <strong>{court.sportTypeName}</strong>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <p>Không tìm thấy thông tin sân.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
                    Chọn sân từ trang chủ
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <Card className="border-border/60 shadow-xl h-fit">
            <CardHeader className="border-b border-border/60 bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Thông tin đặt sân
              </CardTitle>
              <CardDescription>
                {isAuthenticated
                  ? "Bạn đang đặt sân với tài khoản đã đăng nhập."
                  : "Bạn có thể đặt sân mà không cần đăng nhập."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    Ngày đặt sân
                  </label>
                  <Input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) =>
                      setFormData({ ...formData, bookingDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                {/* Time range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giờ bắt đầu</label>
                    <div className="flex gap-1">
                      <select
                        value={formData.startTime.split(":")[0] || ""}
                        onChange={(e) => {
                          const h = e.target.value;
                          const m = formData.startTime.split(":")[1] || "00";
                          setFormData({ ...formData, startTime: `${h}:${m}` });
                        }}
                        className="w-full rounded-md border border-input bg-input px-2 py-2"
                        required
                      >
                        <option value="">Giờ</option>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}h
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData.startTime.split(":")[1] || "00"}
                        onChange={(e) => {
                          const m = e.target.value;
                          const h = formData.startTime.split(":")[0] || "00";
                          setFormData({ ...formData, startTime: `${h}:${m}` });
                        }}
                        className="w-full rounded-md border border-input bg-input px-2 py-2"
                        required
                      >
                        <option value="00">00</option>
                        <option value="30">30</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giờ kết thúc</label>
                    <div className="flex gap-1">
                      <select
                        value={formData.endTime.split(":")[0] || ""}
                        onChange={(e) => {
                          const h = e.target.value;
                          const m = formData.endTime.split(":")[1] || "00";
                          setFormData({ ...formData, endTime: `${h}:${m}` });
                        }}
                        className="w-full rounded-md border border-input bg-input px-2 py-2"
                        required
                      >
                        <option value="">Giờ</option>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}h
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData.endTime.split(":")[1] || "00"}
                        onChange={(e) => {
                          const m = e.target.value;
                          const h = formData.endTime.split(":")[0] || "00";
                          setFormData({ ...formData, endTime: `${h}:${m}` });
                        }}
                        className="w-full rounded-md border border-input bg-input px-2 py-2"
                        required
                      >
                        <option value="00">00</option>
                        <option value="30">30</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Guest info (only show if not logged in) */}
                {!isAuthenticated && (
                  <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Thông tin khách vãng lai
                    </p>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.guestName}
                        onChange={(e) =>
                          setFormData({ ...formData, guestName: e.target.value })
                        }
                        placeholder="Nhập họ tên của bạn"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.guestPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, guestPhone: e.target.value })
                        }
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email {formData.paymentMethod === "PAYPAL" ? <span className="text-red-500">*</span> : "(tùy chọn)"}
                      </label>
                      <Input
                        type="email"
                        value={formData.guestEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, guestEmail: e.target.value })
                        }
                        placeholder="Nhập email (không bắt buộc)"
                      />
                    </div>
                  </div>
                )}

                {/* Logged in user info */}
                {isAuthenticated && user && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Đặt sân với tài khoản
                    </p>
                    <p className="text-sm text-foreground">
                      <strong>Họ tên:</strong> {user.fullName}
                    </p>
                    <p className="text-sm text-foreground">
                      <strong>SĐT:</strong> {user.phone}
                    </p>
                  </div>
                )}

                {/* Payment method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Phương thức thanh toán
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-input px-3 py-2"
                  >
                    <option value="CASH">Tiền mặt (tại sân)</option>
                    <option value="MOMO">MoMo</option>
                    <option value="PAYPAL">PayPal</option>
                  </select>
                </div>

                {/* Price summary */}
                {pricing.isBlocked && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-bold text-destructive text-center">
                      Sân đang có sự kiện/bảo trì trong khung giờ này. Vui lòng chọn khung giờ khác.
                    </p>
                  </div>
                )}

                {pricing.total > 0 && !pricing.isBlocked && (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="font-medium">
                        {(timeToDecimal(formData.endTime) - timeToDecimal(formData.startTime)).toFixed(1)} giờ
                      </span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Khuyến mãi áp dụng:</span>
                        <span>-{formatPrice(pricing.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                      <span className="text-base font-bold">Tổng tạm tính:</span>
                      <div className="flex flex-col items-end">
                        {pricing.discount > 0 && (
                          <span className="text-xs text-muted-foreground line-through mb-0.5">
                            {formatPrice(pricing.original)}
                          </span>
                        )}
                        <span className="text-xl font-black text-primary">
                          {formatPrice(pricing.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}


                <Button
                  type="submit"
                  disabled={submitting || !court || pricing.isBlocked}
                  className="w-full h-12 gap-2 text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CalendarDays className="h-4 w-4" />
                      Xác nhận đặt sân
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
