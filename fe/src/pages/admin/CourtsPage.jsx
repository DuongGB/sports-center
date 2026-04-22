import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, X, Eye } from "lucide-react";
import { useCourtsQuery, useCourtMutations } from "@/hooks/queries/useCourtQueries";
import { useSportTypesQuery } from "@/hooks/queries/useSportTypeQueries";
import { toast } from "react-toastify";

export default function CourtsPage() {
  const [page, setPage] = useState(1);
  const size = 10;
  
  // React Query Hooks
  const { data: courtsQuery, isLoading: courtsLoading } = useCourtsQuery(page, size);
  const courts = courtsQuery?.data || [];
  const totalPages = courtsQuery?.totalPages || 1;

  const { data: sportTypesQuery } = useSportTypesQuery();
  const sportTypes = sportTypesQuery?.data || [];


  const { createCourtMut, updateCourtMut, maintenanceCourtMut } = useCourtMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  
  const [formData, setFormData] = useState({ 
    id: "", name: "", location: "", sportTypeId: "", image: null, imageUrl: "", status: "ACTIVE",
    setupPriceAndAvailability: true,
    commonPrice: 100000,
    openTime: "06:00", 
    closeTime: "22:00"
  });

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ 
      id: "", name: "", location: "", sportTypeId: "", image: null, imageUrl: "",
      status: "ACTIVE", setupPriceAndAvailability: true, commonPrice: 100000,
      openTime: "06:00", closeTime: "22:00"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setFormData({ 
      id: item.id, name: item.name, location: item.location, sportTypeId: item.sportTypeId, image: null, 
      imageUrl: (item.courtImages && item.courtImages.length > 0) ? item.courtImages[0] : item.imageUrl,
      status: item.status || "ACTIVE",
      openTime: item.openTime ? item.openTime.substring(0, 5) : "06:00",
      closeTime: item.closeTime ? item.closeTime.substring(0, 5) : "22:00",
      setupPriceAndAvailability: false, commonPrice: 0 
    });
    setIsModalOpen(true);
  };

  const openViewModal = (item) => {
    setModalMode("view");
    setFormData({ 
      id: item.id, name: item.name, location: item.location, sportTypeId: item.sportTypeId, image: null, 
      imageUrl: (item.courtImages && item.courtImages.length > 0) ? item.courtImages[0] : item.imageUrl,
      status: item.status || "ACTIVE",
      openTime: item.openTime ? item.openTime.substring(0, 5) : "06:00",
      closeTime: item.closeTime ? item.closeTime.substring(0, 5) : "22:00",
      setupPriceAndAvailability: false, commonPrice: 0 
    });
    setIsModalOpen(true);
  };

  const handleMaintenanceToggle = (item) => {
    if (item.status === "ACTIVE") {
      toast.info(
        <div>
          <p>Chuyển sân này sang trạng thái bảo trì?</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => { 
                maintenanceCourtMut.mutate(item.id, {
                  onSuccess: () => toast.success("Đã chuyển sang bảo trì!")
                }); 
                toast.dismiss(); 
              }}>Xác nhận</Button>
            <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>Hủy</Button>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
    } else {
      toast.info(
        <div>
          <p>Chuyển sân này sang trạng thái hoạt động?</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => { 
                const payload = new FormData();
                payload.append("data", new Blob([JSON.stringify({ 
                  name: item.name, 
                  location: item.location, 
                  sportTypeId: item.sportTypeId, 
                  openTime: item.openTime,
                  closeTime: item.closeTime,
                  status: "ACTIVE" 
                })], { type: "application/json" }));
                updateCourtMut.mutate({ id: item.id, formData: payload }, {
                  onSuccess: () => toast.success("Đã chuyển sang hoạt động!")
                });
                toast.dismiss(); 
              }}>Xác nhận</Button>
            <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>Hủy</Button>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.sportTypeId) {
      toast.error("Vui lòng nhập đầy đủ các thông tin bắt buộc");
      return;
    }
    
    const formatTimeWithSeconds = (timeStr) => {
      if (!timeStr) return "00:00:00";
      return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    };

    const requestData = {
      name: formData.name,
      location: formData.location,
      sportTypeId: formData.sportTypeId,
      status: formData.status,
      openTime: formatTimeWithSeconds(formData.openTime),
      closeTime: formatTimeWithSeconds(formData.closeTime),
    };

    // Removed TimeSlot-based setup logic as TimeSlots are no longer used in BE

    const payload = new FormData();
    payload.append(
      "data",
      new Blob([JSON.stringify(requestData)], { type: "application/json" })
    );

    if (formData.image) payload.append("image", formData.image);

    try {
      if (modalMode === "add") {
        await createCourtMut.mutateAsync(payload);
        toast.success("Tạo sân thành công");
      } else {
        await updateCourtMut.mutateAsync({ id: formData.id, formData: payload });
        toast.success("Cập nhật sân thành công");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản Lý Sân Bãi</h1>
        <Button onClick={openAddModal}>Thêm Sân Mới</Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium w-16">Hình Ảnh</th>
                <th className="px-6 py-4 font-medium">Tên Sân</th>
                <th className="px-6 py-4 font-medium">Loại Sân</th>
                <th className="px-6 py-4 font-medium">Giờ Mở/Đóng</th>
                <th className="px-6 py-4 font-medium">Trạng Thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {courtsLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Đang tải dữ liệu...</td>
                </tr>
              ) : courts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Không có bản ghi nào</td>
                </tr>
              ) : (
                courts.map((item) => {
                  const thumbnail = (item.courtImages && item.courtImages.length > 0) ? item.courtImages[0] : item.imageUrl;
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        {thumbnail ? (
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                             <img src={thumbnail} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 text-xs rounded-md bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border leading-none">Trống</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" /> {item.location || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.sportTypeName || "N/A"}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {item.openTime?.substring(0, 5) || "??:??"} - {item.closeTime?.substring(0, 5) || "??:??"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          item.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}>{item.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                         <Button variant="ghost" size="sm" onClick={() => openViewModal(item)} className="text-muted-foreground hover:text-foreground hover:bg-muted"><Eye className="w-4 h-4 mr-1"/> Chi tiết</Button>
                         <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">Sửa</Button>
                         <Button variant="ghost" size="sm" onClick={() => handleMaintenanceToggle(item)} className={item.status === "ACTIVE" ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}>
                            {item.status === "ACTIVE" ? "Bảo trì" : "Kích hoạt"}
                         </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!courtsLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
            <span className="text-sm text-muted-foreground">Trang {page} / {totalPages}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Tiếp</Button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl my-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">{modalMode === "add" ? "Thêm Sân Mới" : modalMode === "edit" ? "Cập nhật Sân" : "Chi Tiết Sân"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {modalMode === "view" && formData.imageUrl && (
                 <div className="flex justify-center mb-4">
                    <img src={formData.imageUrl} alt="Court" className="h-32 w-full object-cover rounded-md border border-border" />
                 </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Tên Sân</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={modalMode === "view"} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loại Thể Thao</label>
                <select value={formData.sportTypeId} onChange={(e) => setFormData({ ...formData, sportTypeId: e.target.value })} required disabled={modalMode === "view"} className="w-full rounded-md border border-input bg-input px-3 py-2 disabled:opacity-50">
                  <option value="">-- Chọn loại thể thao --</option>
                  {sportTypes.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium">Vị Trí</label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required disabled={modalMode === "view"} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giờ Mở Cửa</label>
                  <Input type="time" value={formData.openTime} onChange={(e) => setFormData({ ...formData, openTime: e.target.value })} required disabled={modalMode === "view"} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giờ Đóng Cửa</label>
                  <Input type="time" value={formData.closeTime} onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })} required disabled={modalMode === "view"} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng Thái</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required disabled={modalMode === "view"} className="w-full rounded-md border border-input bg-input px-3 py-2 disabled:opacity-50">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              {modalMode !== "view" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hình Ảnh</label>
                  <Input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
                </div>
              )}
              

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant={modalMode === "view" ? "default" : "outline"} onClick={() => setIsModalOpen(false)}>
                  {modalMode === "view" ? "Đóng" : "Hủy"}
                </Button>
                {modalMode !== "view" && (
                  <Button type="submit" disabled={createCourtMut.isPending || updateCourtMut.isPending}>
                    {createCourtMut.isPending || updateCourtMut.isPending ? "Đang xử lý..." : "Lưu Thay Đổi"}
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
