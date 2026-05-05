import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  const handleRetry = () => {
    localStorage.removeItem("pendingBookingId");
    navigate("/booking");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Thanh toán đã bị hủy</h2>
          <p className="text-muted-foreground">
            Bạn đã hủy quá trình thanh toán qua PayPal. Đơn đặt sân của bạn chưa được hoàn tất.
          </p>
          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full">
              Thử lại
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
