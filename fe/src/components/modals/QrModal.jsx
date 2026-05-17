import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, useRef } from "react";
import { apiCall } from "@/config/api";
import { toast } from "react-toastify";
import {
  Loader2,
  Timer,
  Download,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QrModal({ isOpen, onClose, booking }) {
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [pendingTimeLeft, setPendingTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const pendingTimerRef = useRef(null);
  const qrRef = useRef(null);

  const fetchQr = async () => {
    if (!booking?.id || booking?.bookingStatus === "PENDING") return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall(`/qr/booking/${booking.id}`);
      if (response.success) {
        setQrData({
          ...response.data,
          bookingId: booking.id,
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải mã QR:", err);
      const msg = err.message || "Không thể lấy mã QR";
      setError(msg);
      if (msg.includes("đã được sử dụng")) {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && booking?.id) {
      if (booking.bookingStatus === "PENDING") {
        if (pendingTimerRef.current) clearInterval(pendingTimerRef.current);

        const calculatePendingTime = () => {
          const createdAt = new Date(booking.createdAt).getTime();
          const now = new Date().getTime();
          const diff = 10 * 60 * 1000 - (now - createdAt);

          if (diff <= 0) {
            setPendingTimeLeft(0);
            if (pendingTimerRef.current) clearInterval(pendingTimerRef.current);
            return;
          }

          const m = Math.floor(diff / 60000)
            .toString()
            .padStart(2, "0");
          const s = Math.floor((diff % 60000) / 1000)
            .toString()
            .padStart(2, "0");
          setPendingTimeLeft(`${m}:${s}`);
        };

        calculatePendingTime();
        pendingTimerRef.current = setInterval(calculatePendingTime, 1000);
      } else {
        const isExpired =
          qrData?.expiredAt &&
          new Date(qrData.expiredAt).getTime() <= new Date().getTime();
        if (!qrData || qrData.bookingId !== booking.id || isExpired || error) {
          fetchQr();
        }
      }
    }

    return () => {
      if (pendingTimerRef.current) clearInterval(pendingTimerRef.current);
    };
  }, [isOpen, booking?.id, booking?.bookingStatus]);

  useEffect(() => {
    if (qrData?.expiredAt) {
      if (timerRef.current) clearInterval(timerRef.current);

      const calculateTimeLeft = () => {
        const now = new Date();
        const expiry = new Date(qrData.expiredAt);
        const difference = expiry.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeLeft(0);
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }

        const totalSeconds = Math.floor(difference / 1000);
        if (totalSeconds > 30 * 24 * 3600) {
          setTimeLeft("NO_EXPIRY");
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let timeStr = "";
        if (hours > 0) timeStr += `${hours}h `;
        timeStr += `${minutes}m ${seconds}s`;
        setTimeLeft(timeStr);
      };

      calculateTimeLeft();
      timerRef.current = setInterval(calculateTimeLeft, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qrData]);

  const handleDownload = () => {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_Booking_${booking.id.slice(0, 8)}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-black">
            QR CHECK-IN
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {isLoading ? (
            <div className="flex flex-col items-center text-muted-foreground gap-4 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">Đang kiểm tra dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8 px-6 text-center w-full">
              <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-rose-600" />
              </div>
              <h3 className="font-black text-xl mb-3 text-rose-600">
                Thao tác thất bại
              </h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-[280px] font-medium leading-relaxed">
                {error}
              </p>
              <Button
                onClick={onClose}
                className="w-full font-bold h-11 rounded-xl shadow-lg"
              >
                Đóng
              </Button>
            </div>
          ) : booking?.bookingStatus === "PENDING" ? (
            <div className="flex flex-col items-center py-4 px-6 text-center w-full">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6 relative">
                <Timer className="h-10 w-10 text-orange-600 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-orange-600 uppercase">
                Đang chờ duyệt
              </h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
                Đơn đặt sân đang trong thời gian giữ chỗ. Mã QR sẽ hiển thị sau
                khi đơn được xác nhận.
              </p>
              <div className="w-full bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-inner">
                <p className="text-[10px] uppercase tracking-wider text-orange-700 font-black mb-1">
                  Thời gian giữ chỗ còn lại
                </p>
                <div className="text-4xl font-black text-orange-600 font-mono">
                  {pendingTimeLeft === 0
                    ? "Hết giờ"
                    : pendingTimeLeft || "--:--"}
                </div>
              </div>
            </div>
          ) : qrData?.token && qrData.bookingId === booking?.id ? (
            <>
              <div
                ref={qrRef}
                className="bg-white p-5 rounded-2xl border shadow-xl relative group ring-4 ring-primary/5"
              >
                <QRCodeSVG
                  value={qrData.token}
                  size={250}
                  level="H"
                  className={timeLeft === 0 ? "opacity-20 grayscale" : ""}
                />
                {timeLeft === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-2xl backdrop-blur-[1px]">
                    <button
                      onClick={fetchQr}
                      className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      Lấy mã mới
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-8 flex flex-col items-center gap-5 w-full px-6">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {timeLeft === 0 ? (
                    <span className="text-rose-500 flex items-center gap-1.5 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 uppercase text-xs">
                      Mã đã hết hiệu lực
                    </span>
                  ) : timeLeft === "NO_EXPIRY" ? (
                    <span className="text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase text-[10px] tracking-wider font-black shadow-sm">
                      <CheckCircle className="h-4 w-4" />
                      Mã sử dụng{" "}
                      <span className="text-emerald-700 underline">
                        duy nhất 1 lần
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1.5 bg-muted px-4 py-2 rounded-full border uppercase text-[10px] font-black tracking-widest">
                      <Timer className="h-4 w-4 text-primary" />
                      Còn lại:{" "}
                      <span className="text-primary font-mono text-sm">
                        {timeLeft}
                      </span>
                    </span>
                  )}
                </div>
                {timeLeft !== 0 && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold h-11 rounded-xl shadow-sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" /> Tải ảnh xuống
                  </Button>
                )}
              </div>
            </>
          ) : null}
          <p className="mt-6 text-[10px] font-bold text-center text-muted-foreground max-w-[280px] uppercase tracking-tight">
            {booking?.bookingStatus === "PENDING"
              ? "Vui lòng làm mới trang sau khi thanh toán"
              : "Đưa mã này cho nhân viên để check-in tại sân"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
