import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Eye, CheckCircle, XCircle, Search, Filter, RefreshCcw, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useBookingsQuery, useBookingMutations } from "@/hooks/queries/useBookingQueries";
import { formatDate } from "@/utils/dateUtils";
import { showToast } from "@/utils/toast";

const statusMap = {
  PENDING: { 
    label: "Chờ xác nhận", 
    style: "status-badge status-pending",
  },
  CONFIRMED: { 
    label: "Đã xác nhận", 
    style: "status-badge status-active",
  },
  CANCELLED: { 
    label: "Đã hủy", 
    style: "status-badge status-cancelled",
  },
  COMPLETED: { 
    label: "Hoàn thành", 
    style: "status-badge status-completed",
  },
};

const formatTime = (t) => (t ? t.substring(0, 5) : "??:??");
const formatPrice = (p) => (p != null ? p.toLocaleString("vi-VN") + "đ" : "N/A");

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ keyword: "", status: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const size = 10;
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: bookingsQuery, isLoading } = useBookingsQuery(page, size, filters);
  const bookings = bookingsQuery?.data || [];
  const totalPages = bookingsQuery?.totalPages || 1;
  const totalElements = bookingsQuery?.totalElements || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, keyword: searchTerm }));
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
    setPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({ keyword: "", status: "" });
    setPage(1);
  };

  const selectedBookings = bookings.filter(b => selectedIds.includes(b.id));

  const isBookingInProgress = (booking) => {
    const now = new Date();
    const start = new Date(`${booking.bookingDate}T${booking.startTime}`);
    const end = new Date(`${booking.bookingDate}T${booking.endTime}`);
    return now >= start && now < end;
  };

  const isBookingFinished = (booking) => {
    const now = new Date();
    const end = new Date(`${booking.bookingDate}T${booking.endTime}`);
    return now >= end;
  };

  const canBatchConfirm = selectedIds.length > 0 && selectedBookings.every(b => b.bookingStatus === "PENDING");
  const canBatchCancel = selectedIds.length > 0 && selectedBookings.every(b => 
    (b.bookingStatus === "PENDING" || b.bookingStatus === "CONFIRMED") && 
    !isBookingInProgress(b) && !isBookingFinished(b) && b.paymentStatus !== "SUCCESS"
  );

  const { confirmBookingMut, cancelBookingMut, batchProcessMut } = useBookingMutations();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(bookings.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchAction = (action) => {
    if (selectedIds.length === 0) return;
    
    const actionLabel = action === "CONFIRM" ? "xác nhận" : "hủy";
    showToast.confirm(
      `Thực hiện ${actionLabel} ${selectedIds.length} đơn đã chọn?`,
      () => {
        batchProcessMut.mutate({ ids: selectedIds, action }, {
          onSuccess: () => {
            showToast.success(`Đã ${actionLabel} hàng loạt thành công!`);
            setSelectedIds([]);
          }
        });
      }
    );
  };

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const openViewModal = (booking) => {
    setViewData(booking);
    setIsViewModalOpen(true);
  };

  const handleConfirm = (booking) => {
    showToast.confirm(
      "Xác nhận đơn đặt sân này?",
      () => {
        confirmBookingMut.mutate(booking.id, {
          onSuccess: () => showToast.success("Đã xác nhận đơn đặt sân!")
        });
      }
    );
  };

  const handleCancel = (booking) => {
    setBookingToCancel(booking);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (!bookingToCancel) return;
    cancelBookingMut.mutate({ id: bookingToCancel.id, reason: cancelReason }, {
      onSuccess: () => {
        showToast.success("Đã hủy đơn đặt sân!");
        setIsCancelModalOpen(false);
        setBookingToCancel(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản Lý Đặt Sân</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={() => queryClient.invalidateQueries(["bookings"])}
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm khách hàng, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </form>

          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {(filters.keyword || filters.status) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10">
              <RefreshCcw className="h-4 w-4 mr-2" /> Làm mới
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            {isLoading ? "Đang tìm kiếm..." : (
              filters.keyword || filters.status ? 
                `Tìm thấy ${totalElements} đơn đặt sân phù hợp` : 
                `Tổng cộng ${totalElements} đơn đặt sân`
            )}
          </p>
          {selectedIds.length > 0 && (
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Đã chọn {selectedIds.length} đơn
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleBatchAction("CONFIRM")}
              disabled={!canBatchConfirm}
              title={!canBatchConfirm ? "Chỉ có thể xác nhận các đơn ở trạng thái CHỜ XÁC NHẬN" : ""}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Xác nhận hàng loạt
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleBatchAction("CANCEL")}
              disabled={!canBatchCancel}
              title={!canBatchCancel ? "Chỉ có thể hủy các đơn ở trạng thái CHỜ XÁC NHẬN hoặc ĐÃ XÁC NHẬN" : ""}
            >
              <XCircle className="w-4 h-4 mr-1" /> Hủy hàng loạt
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSelectedIds([])}
            >
              Hủy chọn
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted/80 text-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-semibold w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    checked={bookings.length > 0 && selectedIds.length === bookings.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-4 font-semibold">Khách hàng</th>
                <th className="px-4 py-4 font-semibold">SĐT</th>
                <th className="px-4 py-4 font-semibold">Sân</th>
                <th className="px-4 py-4 font-semibold">Ngày đặt</th>
                <th className="px-4 py-4 font-semibold">Giờ</th>
                <th className="px-4 py-4 font-semibold">Thanh toán</th>
                <th className="px-4 py-4 font-semibold">Tổng tiền</th>
                <th className="px-4 py-4 font-semibold">Trạng thái</th>
                <th className="px-4 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-muted-foreground">
                    Không có bản ghi nào phù hợp
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const status = statusMap[b.bookingStatus] || { label: b.bookingStatus, style: "status-badge status-expired" };
                  return (
                    <tr key={b.id} className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${selectedIds.includes(b.id) ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          checked={selectedIds.includes(b.id)}
                          onChange={() => handleSelectOne(b.id)}
                        />
                      </td>
                      <td className="px-4 py-4 font-medium">{b.customerName || "N/A"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{b.customerPhone || "N/A"}</td>
                      <td className="px-4 py-4 font-medium text-foreground">{b.courtName || "N/A"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{b.bookingDate || "N/A"}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatTime(b.startTime)} - {formatTime(b.endTime)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          b.paymentMethod === 'PAYPAL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          b.paymentMethod === 'MOMO' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {b.paymentMethod || "CASH"}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-primary">{formatPrice(b.totalPrice)}</td>
                      <td className="px-4 py-4">
                        <span className={status.style}>
                          {status.label.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openViewModal(b)} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                          <Eye className="w-4 h-4 mr-1" /> Chi tiết
                        </Button>
                        {b.bookingStatus === "PENDING" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleConfirm(b)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                              <CheckCircle className="w-4 h-4 mr-1" /> Xác nhận
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCancel(b)} 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                              disabled={isBookingInProgress(b) || isBookingFinished(b) || b.paymentStatus === "SUCCESS"}
                              title={
                                isBookingInProgress(b) ? "Không thể hủy khi đang trong giờ chơi" : 
                                isBookingFinished(b) ? "Không thể hủy đơn đã kết thúc" : 
                                b.paymentStatus === "SUCCESS" ? "Không thể hủy đơn đã thanh toán" : ""
                              }
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Hủy
                            </Button>
                          </>
                        )}
                        {b.bookingStatus === "CONFIRMED" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCancel(b)} 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            disabled={isBookingInProgress(b) || isBookingFinished(b) || b.paymentStatus === "SUCCESS"}
                            title={
                              isBookingInProgress(b) ? "Không thể hủy khi đang trong giờ chơi" : 
                              isBookingFinished(b) ? "Không thể hủy đơn đã kết thúc" : 
                              b.paymentStatus === "SUCCESS" ? "Không thể hủy đơn đã thanh toán" : ""
                            }
                          >
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border bg-card gap-4">
            <span className="text-sm text-muted-foreground">
              Hiển thị <span className="font-medium text-foreground">{bookings.length}</span> / {totalElements} kết quả - Trang {page} / {totalPages}
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
                { label: "Trạng thái thanh toán", value: viewData.paymentStatus === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán' },
                { label: "Lý do hủy", value: viewData.cancelReason, condition: viewData.bookingStatus === 'CANCELLED' },
                { label: "Ngày tạo", value: formatDate(viewData.createdAt) },
              ].filter(item => item.condition !== false).map(({ label, value }) => (
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
                  <Button 
                    variant="destructive" 
                    onClick={() => { handleCancel(viewData); setIsViewModalOpen(false); }}
                    disabled={isBookingInProgress(viewData) || isBookingFinished(viewData) || viewData.paymentStatus === "SUCCESS"}
                    title={
                      isBookingInProgress(viewData) ? "Không thể hủy khi đang trong giờ chơi" : 
                      isBookingFinished(viewData) ? "Không thể hủy đơn đã kết thúc" : 
                      viewData.paymentStatus === "SUCCESS" ? "Không thể hủy đơn đã thanh toán" : ""
                    }
                  >
                    Hủy đơn
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Reason Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">Lý do hủy đơn</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Vui lòng nhập lý do hủy đơn để thông báo cho khách hàng.
              </p>
            </div>
            
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary mb-4"
              placeholder="Ví dụ: Sân đang bảo trì, Trùng lịch thi đấu..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmCancel}
                disabled={!cancelReason.trim()}
              >
                Xác nhận hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
