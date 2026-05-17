import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import axios from "axios";

export default function PayPalButton({ amount, bookingId, onSuccess, onError }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const createOrder = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/payment/paypal/create`, {
        amount,
        currency: "USD",
      });
      return response.data.id;
    } catch (error) {
      console.error("PayPal Create Order Error:", error);
      toast.error("Không thể khởi tạo thanh toán PayPal");
      throw error;
    }
  };

  const onApprove = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/api/payment/paypal/capture`, {
        orderId: data.orderID,
        bookingId: bookingId,
      });

      if (response.data.status === "COMPLETED") {
        toast.success("Thanh toán thành công!");
        if (onSuccess) onSuccess(response.data);
      } else {
        toast.error("Thanh toán không hoàn tất. Trạng thái: " + response.data.status);
      }
    } catch (error) {
      console.error("PayPal Capture Order Error:", error);
      toast.error("Có lỗi xảy ra khi xác nhận thanh toán");
      if (onError) onError(error);
    }
  };

  return (
    <div className="w-full">
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => {
          console.error("PayPal Button Error:", err);
          toast.error("Lỗi PayPal Button");
          if (onError) onError(err);
        }}
      />
    </div>
  );
}
