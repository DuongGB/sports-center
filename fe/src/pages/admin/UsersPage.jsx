import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { X, Eye } from "lucide-react";

export default function UsersPage() {
  const { users, loading, page, totalPages, fetchUsers, setPage } = useUsers();
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const openViewModal = (user) => {
    setViewData(user);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản Lý Người Dùng</h1>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Họ Tên</th>
                <th className="px-6 py-4 font-medium">SĐT</th>
                <th className="px-6 py-4 font-medium">Vai Trò</th>
                <th className="px-6 py-4 font-medium">Trạng Thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    Không có bản ghi nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.phone}</td>
                    <td className="px-6 py-4">
                      {user.roles?.map((role) => (
                        <span
                          key={role}
                          className={`px-2.5 py-1 text-xs rounded-full font-medium inline-block mr-1 ${
                            role === "ADMIN"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        user.status === "ACTIVE" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {user.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openViewModal(user)} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Eye className="w-4 h-4 mr-1" /> Chi tiết
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
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

      {/* View Modal */}
      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
                <span className="col-span-2 text-sm text-foreground break-all">{viewData.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">Họ tên:</span>
                <span className="col-span-2 text-sm text-foreground">{viewData.fullName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">SĐT:</span>
                <span className="col-span-2 text-sm text-foreground">{viewData.phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">Vai trò:</span>
                <span className="col-span-2 text-sm text-foreground">{viewData.roles?.join(', ')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                <span className="text-sm font-medium text-muted-foreground">Trạng thái:</span>
                <span className="col-span-2 text-sm text-foreground">{viewData.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Ngày tạo:</span>
                <span className="col-span-2 text-sm text-foreground">{viewData.createdAt || "N/A"}</span>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button onClick={() => setIsViewModalOpen(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
