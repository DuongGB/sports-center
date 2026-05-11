import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/hooks/useUsers";
import { X, Eye, Search, Filter, RefreshCcw } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { showToast } from "@/utils/toast";

export default function UsersPage() {
  const [userFilters, setUserFilters] = useState({ keyword: "", status: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const { users, loading, page, totalPages, totalElements, setPage, setFilters, updateUserMut } = useUsers();
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", fullName: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFilters(userFilters);
  }, [userFilters, setFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setUserFilters(prev => ({ ...prev, keyword: searchTerm }));
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setUserFilters(prev => ({ ...prev, status }));
    setPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setUserFilters({ keyword: "", status: "" });
    setPage(1);
  };

  const openViewModal = (user) => {
    setViewData(user);
    setIsViewModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditForm({
      id: user.id,
      fullName: user.fullName || "",
      phone: user.phone || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUserMut.mutateAsync({
        id: editForm.id,
        data: {
          fullName: editForm.fullName,
          phone: editForm.phone,
        },
      });
      showToast.success("Cập nhật thành công");
      setIsEditModalOpen(false);
    } catch (error) {
      showToast.error(error?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản Lý Người Dùng</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm email, SĐT, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </form>
          
          <select
            value={userFilters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>

          {(userFilters.keyword || userFilters.status) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10">
              <RefreshCcw className="h-4 w-4 mr-2" /> Làm mới
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          {loading ? "Đang tìm kiếm..." : (
            userFilters.keyword || userFilters.status ? 
              `Tìm thấy ${totalElements} người dùng phù hợp` : 
              `Tổng cộng ${totalElements} người dùng`
          )}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted/80 text-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Họ Tên</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">SĐT</th>
                <th className="px-6 py-4 font-semibold">Vai Trò</th>
                <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                <th className="px-6 py-4 font-semibold">Ngày Tạo</th>
                <th className="px-6 py-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                    Không có bản ghi nào phù hợp với tìm kiếm
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.phone}</td>
                    <td className="px-6 py-4">
                      {user.roles?.map((role) => (
                        <span
                          key={role}
                          className={`px-2.5 py-1 text-[11px] rounded-md font-bold uppercase tracking-wider inline-block mr-1 ${
                            role === "ADMIN"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold inline-flex items-center gap-1.5 ${
                        user.status === "ACTIVE" 
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
                          : "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-600" : "bg-red-600"}`} />
                        {user.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openViewModal(user)} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Eye className="w-4 h-4 mr-1" /> Chi tiết
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        Sửa
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border bg-card gap-4">
            <span className="text-sm text-muted-foreground">
              Hiển thị <span className="font-medium text-foreground">{users.length}</span> / {totalElements} kết quả - Trang {page} / {totalPages}
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

      {/* View Modal */}
      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Chi Tiết Người Dùng</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">ID:</span>
                <span className="col-span-2 text-sm text-foreground break-all font-mono">{viewData.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">Họ tên:</span>
                <span className="col-span-2 text-sm font-semibold text-foreground">{viewData.fullName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <span className="col-span-2 text-sm text-foreground">{viewData.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">SĐT:</span>
                <span className="col-span-2 text-sm text-foreground">{viewData.phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">Vai trò:</span>
                <span className="col-span-2 text-sm text-foreground">
                  {viewData.roles?.map(r => (
                    <span key={r} className="inline-block px-2 py-0.5 rounded bg-muted text-[11px] font-bold mr-1">{r}</span>
                  ))}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">Trạng thái:</span>
                <span className={`col-span-2 text-sm font-bold ${viewData.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {viewData.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Ngày tạo:</span>
                <span className="col-span-2 text-sm text-foreground">{formatDate(viewData.createdAt)}</span>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button onClick={() => setIsViewModalOpen(false)} className="w-full sm:w-auto">Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Chỉnh Sửa Người Dùng</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Họ tên</label>
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={submitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
