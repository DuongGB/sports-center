import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Eye, CheckCircle, XCircle } from "lucide-react";
import { useBookingsQuery, useBookingMutations } from "@/hooks/queries/useBookingQueries";
import { formatDate } from "@/utils/dateUtils";
import { toast } from "react-toastify";

const statusMap = {
  PENDING: { label: "Chờ xác nhận", style: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  CONFIRMED: { label: "Đã xác nhận", style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  CANCELLED: { label: "Đã hủy", style: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  COMPLETED: { label: "Hoàn thành", style: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

const formatTime = (t) => (t ? t.substring(0, 5) : "??:??");
const formatPrice = (p) => (p != null ? p.toLocaleString("vi-VN") + "đ" : "N/A");

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const size = 10;

  const { data: bookingsQuery, isLoading } = useBookingsQuery(page, size);
  const bookings = bookingsQuery?.data || [];
  const totalPages = bookingsQuery?.totalPages || 1;

  const { confirmBookingMut, cancelBookingMut } = useBookingMutations();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const openViewModal = (booking) => {
    setViewData(booking);
    setIsViewModalOpen(true);
  };

  const handleConfirm = (booking) => {
    toast.info(
      <div>
        <p>Xác nhận đơn đặt sân này?</p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={() => {
            confirmBookingMut.mutate(booking.id, {
              onSuccess: () => toast.success("Đã xác nhận đơn đặt sân!")
            });
            toast.dismiss();
          }}>Xác nhận</Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>Hủy</Button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  const handleCancel = (booking) => {
    toast.info(
      <div>
        <p>Hủy đơn đặt sân này?</p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="destructive" onClick={() => {
            cancelBookingMut.mutate(booking.id, {
              onSuccess: () => toast.success("Đã hủy đơn đặt sân!")
            });
            toast.dismiss();
          }}>Hủy đơn</Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>Đóng</Button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản Lý Đặt Sân</h1>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-medium">Khách hàng</th>
                <th className="px-4 py-4 font-medium">SĐT</th>
                <th className="px-4 py-4 font-medium">Sân</th>
                <th className="px-4 py-4 font-medium">Ngày đặt</th>
                <th className="px-4 py-4 font-medium">Giờ</th>
                <th className="px-4 py-4 font-medium">Tổng tiền</th>
                <th className="px-4 py-4 font-medium">Trạng thái</th>
                <th className="px-4 py-4 font-medium">Ngày tạo</th>
                <th className="px-4 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-muted-foreground">
                    Không có đơn đặt sân nào
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const status = statusMap[b.bookingStatus] || { label: b.bookingStatus, style: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 font-medium">{b.customerName || "N/A"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{b.customerPhone || "N/A"}</td>
                      <td className="px-4 py-4">{b.courtName || "N/A"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{b.bookingDate || "N/A"}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatTime(b.startTime)} - {formatTime(b.endTime)}
                      </td>
                      <td className="px-4 py-4 font-medium text-primary">{formatPrice(b.totalPrice)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${status.style}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{formatDate(b.createdAt)}</td>
                      <td className="px-4 py-4 text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openViewModal(b)} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                          <Eye className="w-4 h-4 mr-1" /> Chi tiết
                        </Button>
                        {b.bookingStatus === "PENDING" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleConfirm(b)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                              <CheckCircle className="w-4 h-4 mr-1" /> Xác nhận
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleCancel(b)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <XCircle className="w-4 h-4 mr-1" /> Hủy
                            </Button>
                          </>
                        )}
                        {b.bookingStatus === "CONFIRMED" && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(b)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <XCircle className="w-4 h-4 mr-1" /> Hủy
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
            <span className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Trước
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Chi Tiết Đặt Sân</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: "ID", value: viewData.id },
                { label: "Khách hàng", value: viewData.customerName },
                { label: "SĐT", value: viewData.customerPhone },
                { label: "Sân", value: viewData.courtName },
                { label: "Ngày đặt", value: viewData.bookingDate },
                { label: "Giờ chơi", value: `${formatTime(viewData.startTime)} - ${formatTime(viewData.endTime)}` },
                { label: "Tổng tiền", value: formatPrice(viewData.totalPrice) },
                { label: "Trạng thái", value: (statusMap[viewData.bookingStatus] || {}).label || viewData.bookingStatus },
                { label: "Phương thức TT", value: viewData.paymentMethod || "Tiền mặt" },
                { label: "Ngày tạo", value: formatDate(viewData.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="grid grid-cols-3 gap-2 border-b border-border pb-2 last:border-0">
                  <span className="text-sm font-medium text-muted-foreground">{label}:</span>
                  <span className="col-span-2 text-sm text-foreground break-all">{value || "N/A"}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-end gap-3">
              {viewData.bookingStatus === "PENDING" && (
                <>
                  <Button onClick={() => { handleConfirm(viewData); setIsViewModalOpen(false); }} className="bg-emerald-600 hover:bg-emerald-700">
                    Xác nhận
                  </Button>
                  <Button variant="destructive" onClick={() => { handleCancel(viewData); setIsViewModalOpen(false); }}>
                    Hủy đơn
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
