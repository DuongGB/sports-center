import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Eye,
  Search,
  RefreshCcw,
  Plus,
  Calendar,
  Tag,
  Ban,
  Trash2,
  Edit,
  Zap,
} from "lucide-react";
import { showToast } from "@/utils/toast";
import { eventService } from "@/services/eventService";
import { useEventsQuery } from "@/hooks/queries/useEventQueries";
import { useSportTypesQuery } from "@/hooks/queries/useSportTypeQueries";
import { useCourtsQuery } from "@/hooks/queries/useCourtQueries";
import { useQueryClient } from "@tanstack/react-query";

const EVENT_TYPE_LABELS = {
  BLOCK_BOOKING: "Khóa sân",
  DISCOUNT_PERCENT: "Giảm giá %",
  DISCOUNT_FIXED: "Giảm giá cố định",
};
const EVENT_SCOPE_LABELS = {
  ALL_COURTS: "Tất cả sân",
  SPORT_TYPE: "Theo loại sân",
  COURT: "Theo sân cụ thể",
};
const EVENT_STATUS_LABELS = {
  DRAFT: "Nháp",
  ACTIVE: "Đang hoạt động",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
};
const STATUS_COLORS = {
  DRAFT: "status-badge status-pending",
  ACTIVE: "status-badge status-active",
  EXPIRED: "status-badge status-expired",
  CANCELLED: "status-badge status-cancelled",
};

const INITIAL_FORM = {
  name: "",
  description: "",
  type: "DISCOUNT_PERCENT",
  scope: "ALL_COURTS",
  status: "DRAFT",
  startDatetime: "",
  endDatetime: "",
  discountPercent: "",
  discountAmount: "",
  blockReason: "",
  targets: [],
};

export default function EventsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [originalStatus, setOriginalStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const queryClient = useQueryClient();
  
  const { data: events = [], isLoading: loading } = useEventsQuery(statusFilter);
  const { data: stPageData } = useSportTypesQuery(1, 100);
  const { data: cPageData } = useCourtsQuery(1, 100);

  const sportTypes = Array.isArray(stPageData?.data) ? stPageData.data : (Array.isArray(stPageData?.content) ? stPageData.content : (Array.isArray(stPageData) ? stPageData : []));
  const courts = Array.isArray(cPageData?.data) ? cPageData.data : (Array.isArray(cPageData?.content) ? cPageData.content : (Array.isArray(cPageData) ? cPageData : []));

  const fetchEvents = () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData(INITIAL_FORM);
    setOriginalStatus(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || "",
      type: item.type,
      scope: item.scope,
      status: item.status,
      startDatetime: item.startDatetime?.slice(0, 16) || "",
      endDatetime: item.endDatetime?.slice(0, 16) || "",
      discountPercent: item.discountPercent ?? "",
      discountAmount: item.discountAmount ?? "",
      blockReason: item.blockReason || "",
      targets: (item.targets || []).map((t) => ({
        sportTypeId: t.sportTypeId || "",
        courtId: t.courtId || "",
      })),
    });
    setOriginalStatus(item.status);
    setIsModalOpen(true);
  };

  const openViewModal = (item) => {
    openEditModal(item);
    setModalMode("view");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim())
      return showToast.error("Tên sự kiện không được để trống");
    if (!formData.type)
      return showToast.error("Vui lòng chọn loại sự kiện");
    if (!formData.scope)
      return showToast.error("Vui lòng chọn phạm vi áp dụng");
    if (!formData.startDatetime || !formData.endDatetime)
      return showToast.error("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc");
    
    const start = new Date(formData.startDatetime);
    const end = new Date(formData.endDatetime);
    const now = new Date();

    if (end <= start)
      return showToast.error("Thời gian kết thúc phải sau thời gian bắt đầu");

    if (formData.status === "ACTIVE") {
      if (end <= now) {
        return showToast.error("Không thể kích hoạt sự kiện đã hết hạn");
      }
      // Nếu là tạo mới hoặc đổi từ trạng thái khác sang ACTIVE
      if (modalMode === "add" || originalStatus !== "ACTIVE") {
        if (start < new Date(now.getTime() - 5 * 60000)) { // Cho phép trễ 5 phút
          return showToast.error("Thời gian bắt đầu không được ở quá khứ khi kích hoạt sự kiện");
        }
      }
    }

    if (formData.scope !== "ALL_COURTS" && formData.targets.length === 0)
      return showToast.error("Vui lòng thêm ít nhất 1 đối tượng áp dụng (Môn thể thao hoặc Sân cụ thể)");

    const doSubmit = async () => {
      setSubmitting(true);
      try {
        const payload = {
          ...formData,
          discountPercent: formData.discountPercent
            ? Number(formData.discountPercent)
            : null,
          discountAmount: formData.discountAmount
            ? Number(formData.discountAmount)
            : null,
          targets:
            formData.scope === "ALL_COURTS"
              ? []
              : formData.targets.map((t) => ({
                  sportTypeId: t.sportTypeId || null,
                  courtId: t.courtId || null,
                })),
        };
        delete payload.id;

        if (modalMode === "add") {
          await eventService.createEvent(payload);
          showToast.success("Tạo sự kiện thành công");
        } else {
          await eventService.updateEvent(formData.id, payload);
          showToast.success("Cập nhật sự kiện thành công");
        }
        setIsModalOpen(false);
        fetchEvents();
      } catch (err) {
        showToast.error(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    if (
      modalMode === "edit" &&
      originalStatus === "CANCELLED" &&
      formData.status === "ACTIVE"
    ) {
      showToast.confirm(
        "Sự kiện này đang bị hủy. Bạn có chắc chắn muốn kích hoạt lại?",
        doSubmit,
        "Kích hoạt lại",
      );
    } else {
      doSubmit();
    }
  };

  const handleCancel = (id) => {
    showToast.confirm(
      "Bạn có chắc chắn muốn hủy sự kiện này?",
      async () => {
        try {
          await eventService.cancelEvent(id);
          showToast.success("Đã hủy sự kiện");
          fetchEvents();
        } catch (err) {
          showToast.error(err.message);
        }
      },
      "Hủy sự kiện",
    );
  };

  const handleDelete = (id) => {
    showToast.confirm(
      "Bạn có chắc chắn muốn xóa sự kiện này?",
      async () => {
        try {
          await eventService.deleteEvent(id);
          showToast.success("Đã xóa sự kiện");
          fetchEvents();
        } catch (err) {
          showToast.error(err.message);
        }
      },
      "Xóa",
    );
  };

  const handleActivate = (ev) => {
    const isCancelled = ev.status === "CANCELLED";
    showToast.confirm(
      isCancelled 
        ? "Sự kiện này đang bị hủy. Bạn có chắc chắn muốn kích hoạt lại ngay bây giờ?" 
        : "Kích hoạt sự kiện này ngay bây giờ?",
      async () => {
        try {
          const now = new Date();
          const startDatetime = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16);
          const payload = {
            name: ev.name,
            description: ev.description,
            type: ev.type,
            scope: ev.scope,
            status: "ACTIVE",
            startDatetime,
            endDatetime: ev.endDatetime?.slice(0, 16),
            discountPercent: ev.discountPercent,
            discountAmount: ev.discountAmount,
            blockReason: ev.blockReason,
            targets: (ev.targets || []).map((t) => ({
              sportTypeId: t.sportTypeId || null,
              courtId: t.courtId || null,
            })),
          };
          await eventService.updateEvent(ev.id, payload);
          showToast.success("Đã kích hoạt sự kiện");
          fetchEvents();
        } catch (err) {
          showToast.error(err.message);
        }
      },
      "Kích hoạt",
    );
  };

  const openSelectionModal = () => {
    const ids = formData.targets
      .map((t) => (formData.scope === "SPORT_TYPE" ? t.sportTypeId : t.courtId))
      .filter(Boolean);
    setSelectedIds(ids);
    setIsSelectionModalOpen(true);
  };

  const handleSelectionSave = () => {
    const newTargets = selectedIds.map((id) =>
      formData.scope === "SPORT_TYPE"
        ? { sportTypeId: id, courtId: "" }
        : { sportTypeId: "", courtId: id },
    );
    setFormData((p) => ({ ...p, targets: newTargets }));
    setIsSelectionModalOpen(false);
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const fmt = (dt) => (dt ? new Date(dt).toLocaleString("vi-VN") : "—");

  const isView = modalMode === "view";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Quản Lý Sự Kiện
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
            className="h-10 rounded-md border border-input bg-input px-3 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(EVENT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          {statusFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("")}
              className="h-10"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Làm mới
            </Button>
          )}
          <Button onClick={openAddModal} className="h-10 ml-auto sm:ml-0">
            <Plus className="h-4 w-4 mr-2" /> Thêm Sự Kiện
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground font-medium">
        {loading ? "Đang tải..." : `Tổng cộng ${events.length} sự kiện`}
      </p>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted/80 text-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-semibold">Tên</th>
                <th className="px-4 py-4 font-semibold">Loại</th>
                <th className="px-4 py-4 font-semibold">Phạm vi</th>
                <th className="px-4 py-4 font-semibold">Trạng thái</th>
                <th className="px-4 py-4 font-semibold">Thời gian</th>
                <th className="px-4 py-4 font-semibold">Giảm giá</th>
                <th className="px-4 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-muted-foreground">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Không có sự kiện nào
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                      {ev.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="status-badge status-completed">
                        <Tag className="h-3 w-3" /> {EVENT_TYPE_LABELS[ev.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {EVENT_SCOPE_LABELS[ev.scope]}
                    </td>
                    <td className="px-4 py-3">
                      <span className={STATUS_COLORS[ev.status]}>
                        {EVENT_STATUS_LABELS[ev.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <div>{fmt(ev.startDatetime)}</div>
                      <div className="text-muted-foreground">
                        → {fmt(ev.endDatetime)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {ev.type === "DISCOUNT_PERCENT" && ev.discountPercent
                        ? `${ev.discountPercent}%`
                        : ""}
                      {ev.type === "DISCOUNT_FIXED" && ev.discountAmount
                        ? `${Number(ev.discountAmount).toLocaleString("vi-VN")}đ`
                        : ""}
                      {ev.type === "BLOCK_BOOKING" ? (
                        <span className="text-red-500">Khóa sân</span>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewModal(ev)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(ev)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {ev.status === "ACTIVE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(ev.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          title="Hủy sự kiện"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                      {(ev.status === "DRAFT" || ev.status === "CANCELLED") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivate(ev)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          title="Kích hoạt ngay"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ev.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-xl border border-border bg-card shadow-xl flex flex-col overflow-hidden">
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {modalMode === "add"
                    ? "Thêm Sự Kiện"
                    : modalMode === "edit"
                      ? "Sửa Sự Kiện"
                      : "Chi Tiết Sự Kiện"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tên sự kiện *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    disabled={isView}
                    placeholder="VD: Giảm giá Quốc Khánh 2/9"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    disabled={isView}
                    className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm min-h-[80px]"
                    placeholder="Mô tả chi tiết sự kiện..."
                  />
                </div>

                {/* Type + Scope */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Loại sự kiện *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, type: e.target.value }))
                      }
                      disabled={isView}
                      className="w-full h-10 rounded-md border border-input bg-input px-3 text-sm"
                    >
                      {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Phạm vi *</label>
                    <select
                      value={formData.scope}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          scope: e.target.value,
                          targets: [],
                        }))
                      }
                      disabled={isView}
                      className="w-full h-10 rounded-md border border-input bg-input px-3 text-sm"
                    >
                      {Object.entries(EVENT_SCOPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status + Dates */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, status: e.target.value }))
                    }
                    disabled={isView}
                    className="w-full h-10 rounded-md border border-input bg-input px-3 text-sm"
                  >
                    {Object.entries(EVENT_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Bắt đầu *</label>
                    <Input
                      type="datetime-local"
                      value={formData.startDatetime}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          startDatetime: e.target.value,
                        }))
                      }
                      disabled={isView}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Kết thúc *</label>
                    <Input
                      type="datetime-local"
                      value={formData.endDatetime}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          endDatetime: e.target.value,
                        }))
                      }
                      disabled={isView}
                    />
                  </div>
                </div>

                {/* Discount fields */}
                {formData.type === "DISCOUNT_PERCENT" && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Phần trăm giảm giá (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          discountPercent: e.target.value,
                        }))
                      }
                      disabled={isView}
                      placeholder="VD: 10"
                    />
                  </div>
                )}
                {formData.type === "DISCOUNT_FIXED" && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Số tiền giảm (VNĐ)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.discountAmount}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          discountAmount: e.target.value,
                        }))
                      }
                      disabled={isView}
                      placeholder="VD: 50000"
                    />
                  </div>
                )}
                {formData.type === "BLOCK_BOOKING" && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Lý do khóa sân
                    </label>
                    <Input
                      value={formData.blockReason}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          blockReason: e.target.value,
                        }))
                      }
                      disabled={isView}
                      placeholder="VD: Bảo trì sân"
                    />
                  </div>
                )}

                {/* Targets */}
                {formData.scope !== "ALL_COURTS" && (
                  <div className="space-y-2 border border-border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Đối tượng áp dụng ({formData.targets.length})
                      </label>
                      {!isView && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={openSelectionModal}
                        >
                          {formData.scope === "SPORT_TYPE"
                            ? "Chọn Loại Sân"
                            : "Chọn Sân"}
                        </Button>
                      )}
                    </div>
                    {formData.targets.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.targets.map((t, i) => {
                          let name = "";
                          if (formData.scope === "SPORT_TYPE") {
                            name =
                              sportTypes.find((st) => st.id === t.sportTypeId)
                                ?.name || "Đang tải...";
                          } else {
                            name =
                              courts.find((c) => c.id === t.courtId)?.name ||
                              "Đang tải...";
                          }
                          return (
                            <span
                              key={i}
                              className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic text-center">
                        Chưa chọn đối tượng nào.
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant={isView ? "default" : "outline"}
                    onClick={() => setIsModalOpen(false)}
                  >
                    {isView ? "Đóng" : "Hủy"}
                  </Button>
                  {!isView && (
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Đang lưu..." : "Lưu"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Target Selection Modal */}
      {isSelectionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md max-h-[80vh] rounded-xl border border-border bg-card shadow-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-foreground">
                {formData.scope === "SPORT_TYPE" ? "Chọn Loại Sân" : "Chọn Sân"}
              </h3>
              <button
                onClick={() => setIsSelectionModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
              {formData.scope === "SPORT_TYPE" &&
                sportTypes.map((st) => (
                  <label
                    key={st.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(st.id)}
                      onChange={() => toggleSelection(st.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">{st.name}</span>
                  </label>
                ))}
              {formData.scope === "COURT" &&
                courts.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelection(c.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {sportTypes.find((st) => st.id === c.sportTypeId)
                          ?.name || ""}
                      </span>
                    </div>
                  </label>
                ))}
              {((formData.scope === "SPORT_TYPE" && sportTypes.length === 0) ||
                (formData.scope === "COURT" && courts.length === 0)) && (
                <div className="text-center text-muted-foreground p-4">
                  Không có dữ liệu.
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionModalOpen(false)}
              >
                Hủy
              </Button>
              <Button size="sm" onClick={handleSelectionSave}>
                Xác nhận ({selectedIds.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
