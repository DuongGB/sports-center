import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const isExecuting = useRef(false);
  
  const token = searchParams.get("token");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const capturePayment = async () => {
      if (isExecuting.current) return;
      
      const bookingId = localStorage.getItem("pendingBookingId");
      if (!token || !bookingId) {
        setLoading(false);
        return;
      }

      isExecuting.current = true;
      try {
        const response = await axios.post(`${API_URL}/api/payment/paypal/capture`, {
          orderId: token,
          bookingId: bookingId
        });

        if (response.data.success) {
          setSuccess(true);
          localStorage.removeItem("pendingBookingId");
          toast.success("Thanh toán thành công!");
        } else {
          toast.error(response.data.message || "Thanh toán không thành công");
        }
      } catch (error) {
        console.error("Capture Error:", error);
        toast.error("Lỗi khi xác nhận thanh toán");
      } finally {
        setLoading(false);
      }
    };

    capturePayment();
  }, [token, API_URL]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          {loading ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Đang xác nhận thanh toán...</h2>
              <p className="text-muted-foreground text-sm">Vui lòng không đóng trình duyệt.</p>
            </>
          ) : success ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Thanh toán thành công!</h2>
              <p className="text-muted-foreground">
                Đơn đặt sân của bạn đã được xác nhận. Chúng tôi sẽ sớm gửi thông tin chi tiết qua email.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Về trang chủ
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Xác nhận thất bại</h2>
              <p className="text-muted-foreground">
                Có lỗi xảy ra trong quá trình xác nhận thanh toán. Vui lòng liên hệ bộ phận hỗ trợ.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Về trang chủ
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
