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
    const { name, value } = e.target;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
            <a href="#" className="hover:underline text-primary font-medium">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </Button>
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
