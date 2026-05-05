import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Thiếu token khôi phục mật khẩu");
      navigate("/");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(token, formData.newPassword);
      if (response.success) {
        setSuccess(true);
        toast.success("Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (error) {
      toast.error(error?.message || "Link đã hết hạn hoặc không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8 p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật mật khẩu"
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 animate-bounce" />
            <div className="p-4 rounded-xl bg-green-500/10 text-green-600 font-medium">
              Mật khẩu của bạn đã được cập nhật thành công!
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Đang quay lại trang chủ trong giây lát...
            </p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full h-11">
              Về trang chủ ngay
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
