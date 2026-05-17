import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { User, Phone, Lock, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, fetchCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password) {
      if (formData.password.length < 8) {
        toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }
      if (!formData.oldPassword) {
        toast.error("Vui lòng nhập mật khẩu hiện tại để thay đổi mật khẩu");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
      };
      
      if (formData.password) {
        payload.password = formData.password;
        payload.oldPassword = formData.oldPassword;
      }

      const response = await userService.updateUser(user.id, payload);
      
      if (response.success) {
        toast.success("Cập nhật thông tin thành công");
        await fetchCurrentUser();
        setFormData(prev => ({ ...prev, oldPassword: "", password: "", confirmPassword: "" }));
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error(error?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="h-32 w-32 rounded-full border-4 border-primary bg-muted overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
              alt={user.fullName}
              className="h-full w-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold">{user.fullName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {user.roles?.join(", ")}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Họ và tên
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Số điện thoại
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Đổi mật khẩu
            </h3>
            <p className="text-xs text-muted-foreground">Để trống nếu không muốn thay đổi mật khẩu. Nếu đổi mật khẩu, bạn cần nhập mật khẩu cũ.</p>
            
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu hiện tại để xác nhận"
                className="bg-muted/50"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto gap-2"
            >
              {loading ? "Đang lưu..." : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
