import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  onForgotPassword,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "phone" || name === "password") {
      value = value.trim();
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.password) {
      setFormError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!/^0\d{9}$/.test(formData.phone)) {
      setFormError("Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số");
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      setFormData({ phone: "", password: "" });
      setFormError("");
      onSuccess?.();
    } catch (err) {
      setFormError(err || "Đăng nhập thất bại");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Đăng Nhập</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Message */}
        {(error || formError) && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error || formError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Input */}
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-foreground"
            >
              Số Điện Thoại
            </label>
            <Input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0356309561"
              disabled={loading}
              className="border-input bg-input"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Mật Khẩu
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="border-input bg-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.039m10.318 10.318L3.039 3.596"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input bg-input accent-primary"
              />
              <span className="text-foreground">Ghi nhớ tôi</span>
            </label>
            <button 
              type="button"
              onClick={onForgotPassword}
              className="hover:underline text-primary font-medium"
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </Button>
          
          {/* OR divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Hoặc đăng nhập bằng</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            {/* Google Login Button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-white text-black hover:bg-gray-50 border-gray-300 dark:bg-slate-900 dark:text-white dark:border-slate-800 dark:hover:bg-slate-800"
              onClick={() => window.location.href = "http://localhost:8080/oauth2/authorize/google"}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            {/* Facebook Login Button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-[#1877F2] text-white hover:bg-[#166fe5] border-transparent dark:bg-[#0866FF] dark:hover:bg-[#0055e5]"
              onClick={() => window.location.href = "http://localhost:8080/oauth2/authorize/facebook"}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="font-medium text-primary hover:underline"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
}
