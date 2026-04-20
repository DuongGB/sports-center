import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { timeSlotService } from "@/services/timeSlotService";
import { X } from "lucide-react";

export default function TimeSlotsPage() {
  const { timeSlots, loading, fetchTimeSlots } = useTimeSlots();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [formData, setFormData] = useState({ id: "", startTime: "", endTime: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: "", startTime: "", endTime: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    // Giả sử API BE cần định dạng "HH:mm" - Cắt giây nếu có
    const formatTime = (t) => t ? t.substring(0, 5) : "";
    setFormData({ id: item.id, startTime: formatTime(item.startTime), endTime: formatTime(item.endTime) });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startTime || !formData.endTime) {
      setFormError("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc");
      return;
    }
    
    // Thêm giây ":00" nếu backend đòi hỏi LocalTime đầy đủ
    const buildTime = (t) => t.length === 5 ? t + ":00" : t;

    setSubmitting(true);
    setFormError("");
    const payload = { 
      startTime: buildTime(formData.startTime), 
      endTime: buildTime(formData.endTime) 
    };

    try {
      if (modalMode === "add") {
        await timeSlotService.createTimeSlot(payload);
      } else {
        await timeSlotService.updateTimeSlot(formData.id, payload);
      }
      setIsModalOpen(false);
      fetchTimeSlots(); // Reload data
    } catch (error) {
      setFormError(error?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khung giờ này?")) {
      try {
        await timeSlotService.deleteTimeSlot(id);
        fetchTimeSlots();
      } catch (error) {
        alert(error?.message || "Xóa thất bại");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản Lý Khung Giờ</h1>
        <Button onClick={openAddModal}>Thêm Khung Giờ</Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Bắt Đầu</th>
                <th className="px-6 py-4 font-medium">Kết Thúc</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : timeSlots.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">
                    Không có bản ghi nào
                  </td>
                </tr>
              ) : (
                timeSlots.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.startTime}</td>
                    <td className="px-6 py-4 font-medium">{item.endTime}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditModal(item)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        Sửa
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {modalMode === "add" ? "Thêm Khung Giờ Mới" : "Sửa Khung Giờ"}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Thời Gian Bắt Đầu</label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  disabled={submitting}
                  className="border-input bg-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Thời Gian Kết Thúc</label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  disabled={submitting}
                  className="border-input bg-input"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={submitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu Thay Đổi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
