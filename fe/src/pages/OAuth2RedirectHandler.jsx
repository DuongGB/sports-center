import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setTokens } from "@/store/authSlice";
import { toast } from "react-toastify";

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      // Save tokens to localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Save tokens to Redux store
      dispatch(setTokens({ accessToken, refreshToken }));

      toast.success("Đăng nhập thành công!");

      // Redirect to home page
      navigate("/", { replace: true });
    } else {
      toast.error("Đăng nhập thất bại. Không tìm thấy thông tin xác thực.");
      // If tokens are missing, redirect to home page as well
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-muted-foreground">Đang xử lý đăng nhập...</span>
    </div>
  );
}
