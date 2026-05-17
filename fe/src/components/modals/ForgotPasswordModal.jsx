import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
        toast.success("Yêu cầu đã được gửi! Vui lòng kiểm tra email.");
      }
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div 
        className="w-full max-w-md scale-in-center overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Quên mật khẩu?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="pl-10 h-11 bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  "Gửi yêu cầu khôi phục"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 mb-6">
                <p className="text-sm font-medium leading-relaxed">
                  Chúng tôi đã gửi hướng dẫn khôi phục đến <b>{email}</b>. Vui lòng kiểm tra cả hộp thư rác (spam).
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={onBackToLogin}
                className="w-full h-11 font-medium hover:bg-muted"
              >
                Quay lại đăng nhập
              </Button>
            </div>
          )}

          {/* Footer */}
          {!success && (
            <div className="mt-8 text-center border-t border-border pt-6">
              <button
                onClick={onBackToLogin}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại trang đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
