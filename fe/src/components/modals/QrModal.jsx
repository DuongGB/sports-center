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
import { Loader2, Timer } from "lucide-react";

export default function QrModal({ isOpen, onClose, booking }) {
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const fetchQr = async () => {
    if (!booking?.id) return;
    setIsLoading(true);
    try {
      const response = await apiCall(`/qr/booking/${booking.id}`);
      if (response.success) {
        setQrData({
          ...response.data,
          bookingId: booking.id
        });
      } else {
        toast.error("Không thể lấy mã QR");
      }
    } catch (error) {
      toast.error("Lỗi khi tải mã QR: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && booking?.id) {
      // Chỉ gọi API nếu chưa có data hoặc data của booking khác hoặc data đã hết hạn
      const isExpired = qrData?.expiredAt && new Date(qrData.expiredAt).getTime() <= new Date().getTime();
      
      if (!qrData || qrData.bookingId !== booking.id || isExpired) {
        fetchQr();
      }
    }
    // Không set null khi đóng modal để giữ lại cache nếu mở lại chính booking đó
  }, [isOpen, booking?.id]);

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
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      };

      calculateTimeLeft();
      timerRef.current = setInterval(calculateTimeLeft, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qrData]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Mã QR Nhận Sân</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          {isLoading ? (
            <div className="flex flex-col items-center text-muted-foreground gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p>Đang tạo mã QR...</p>
            </div>
          ) : qrData?.token && qrData.bookingId === booking?.id ? (
            <>
              <div className="bg-white p-4 rounded-xl border shadow-sm relative group">
                <QRCodeSVG 
                  value={qrData.token} 
                  size={256} 
                  level="H" 
                  className={timeLeft === 0 ? "opacity-20 grayscale" : ""}
                />
                {timeLeft === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl">
                    <button 
                      onClick={fetchQr}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                      Tạo lại mã mới
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-sm font-medium">
                {timeLeft === 0 ? (
                  <span className="text-destructive flex items-center gap-1">
                    Mã đã hết hạn
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full border">
                    <Timer className="h-4 w-4 text-primary" />
                    Hiệu lực còn lại: <span className="text-primary font-mono">{timeLeft}</span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Không có mã QR</p>
          )}
          <p className="mt-6 text-sm text-center text-muted-foreground max-w-[280px]">
            Đưa mã này cho nhân viên sân để check-in nhận sân.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
