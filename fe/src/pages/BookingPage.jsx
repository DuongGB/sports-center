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
import { courtService } from "@/services/courtService";
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

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courtId = searchParams.get("courtId");
  const { user, isAuthenticated } = useAuth();

  const [court, setCourt] = useState(null);
  const [loadingCourt, setLoadingCourt] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [formData, setFormData] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    paymentMethod: "CASH",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
  });

  useEffect(() => {
    if (courtId) {
      courtService
        .getAllCourts(1, 100)
        .then((res) => {
          if (res.success && res.data?.data) {
            const found = res.data.data.find((c) => c.id === courtId);
            setCourt(found || null);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingCourt(false));
    } else {
      setLoadingCourt(false);
    }
  }, [courtId]);

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

  const formatPrice = (p) =>
    p != null ? p.toLocaleString("vi-VN") + "đ" : "N/A";

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
                <strong>Trạng thái:</strong>{" "}
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Chờ xác nhận
                </span>
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <Button onClick={() => navigate("/")} className="w-full">
                Về trang chủ
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBookingSuccess(null);
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
                  <div className="text-sm text-muted-foreground">
                    Loại sân: <strong>{court.sportTypeName}</strong>
                  </div>
                  {court.prices && court.prices.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Bảng giá:</p>
                      {court.prices.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2"
                        >
                          <span className="text-muted-foreground">
                            {p.startTime} - {p.endTime}
                          </span>
                          <span className="font-semibold text-primary">
                            {formatPrice(p.price)}/giờ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giờ kết thúc</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                    />
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
                        Email (tùy chọn)
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

                <Button
                  type="submit"
                  disabled={submitting || !court}
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
