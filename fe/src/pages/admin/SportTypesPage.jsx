import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSportTypes } from "@/hooks/useSportTypes";
import { sportTypeService } from "@/services/sportTypeService";
import { X, Eye } from "lucide-react";
import { toast } from "react-toastify";

export default function SportTypesPage() {
  const { sportTypes, loading, page, totalPages, fetchSportTypes, setPage } = useSportTypes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [formData, setFormData] = useState({ id: "", name: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSportTypes(page);
  }, [page, fetchSportTypes]);

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: "", name: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setFormData({ id: item.id, name: item.name });
    setFormError("");
    setIsModalOpen(true);
  };

  const openViewModal = (item) => {
    setModalMode("view");
    setFormData({ id: item.id, name: item.name });
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
    if (!formData.name.trim()) {
      toast.error("Tên môn thể thao không được để trống");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      if (modalMode === "add") {
        await sportTypeService.createSportType({ name: formData.name.trim() });
        toast.success("Thêm loại sân thành công");
      } else {
        await sportTypeService.updateSportType(formData.id, { name: formData.name.trim() });
        toast.success("Cập nhật loại sân thành công");
      }
      setIsModalOpen(false);
      fetchSportTypes(page); // Reload data
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>Bạn có chắc chắn muốn xóa môn thể thao này?</p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="destructive" onClick={async () => {
              try {
                await sportTypeService.deleteSportType(id);
                fetchSportTypes(page);
                toast.success("Xóa thành công");
              } catch (error) {
                toast.error(error?.message || "Xóa thất bại");
              }
              toast.dismiss();
          }}>Xác nhận</Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>Hủy</Button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Loại Sân Thể Thao</h1>
        <Button onClick={openAddModal}>Thêm Mới</Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Tên Môn Thể Thao</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : sportTypes.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-muted-foreground">
                    Không có bản ghi nào
                  </td>
                </tr>
              ) : (
                sportTypes.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openViewModal(item)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Chi tiết
                      </Button>
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

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
            <span className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {modalMode === "add" ? "Thêm Loại Sân" : modalMode === "edit" ? "Sửa Loại Sân" : "Chi Tiết Loại Sân"}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {modalMode === "view" && (
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-muted-foreground">ID Môn Thể Thao</label>
                  <div className="p-2 border border-border rounded-md bg-muted text-sm break-all">
                    {formData.id}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tên Môn Thể Thao</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.trimStart() })}
                  placeholder="Ví dụ: Bóng đá mini"
                  disabled={submitting || modalMode === "view"}
                  className="border-input bg-input"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant={modalMode === "view" ? "default" : "outline"} onClick={handleCloseModal} disabled={submitting}>
                  {modalMode === "view" ? "Đóng" : "Hủy"}
                </Button>
                {modalMode !== "view" && (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
