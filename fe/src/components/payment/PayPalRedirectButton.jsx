import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function PayPalRedirectButton({ amount, bookingId }) {
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/payment/paypal/create`, {
        amount,
        currency: "USD",
        bookingId // backend needs to know which booking this is for redirect context if needed
      });

      if (response.data.approveUrl) {
        // Store bookingId in localStorage to retrieve it on the success page
        localStorage.setItem("pendingBookingId", bookingId);
        window.location.href = response.data.approveUrl;
      } else {
        toast.error("Không tìm thấy link thanh toán PayPal");
      }
    } catch (error) {
      console.error("PayPal Redirect Error:", error);
      toast.error("Có lỗi xảy ra khi khởi tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full bg-[#ffc439] hover:bg-[#f2ba36] text-black font-semibold h-12 gap-2"
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <>
          <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
          Thanh toán bằng PayPal (Redirect)
        </>
      )}
    </Button>
  );
}
