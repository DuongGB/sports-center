import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, X } from "lucide-react";
import { useCourtsQuery, useCourtMutations } from "@/hooks/queries/useCourtQueries";
import { useSportTypesQuery } from "@/hooks/queries/useSportTypeQueries";
import { useTimeSlotsQuery } from "@/hooks/queries/useTimeSlotQueries";
import { courtPriceService } from "@/services/courtPriceService";
import { courtAvailabilityService } from "@/services/courtAvailabilityService";

export default function CourtsPage() {
  const [page, setPage] = useState(1);
  const size = 10;
  
  // React Query Hooks
  const { data: courtsQuery, isLoading: courtsLoading } = useCourtsQuery(page, size);
  const courts = courtsQuery?.data || [];
  const totalPages = courtsQuery?.totalPages || 1;

  const { data: sportTypesQuery } = useSportTypesQuery();
  const sportTypes = sportTypesQuery?.data || [];

  const { data: timeSlots } = useTimeSlotsQuery();

  const { createCourtMut, updateCourtMut, maintenanceCourtMut } = useCourtMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [formError, setFormError] = useState("");
  
  const [formData, setFormData] = useState({ 
    id: "", name: "", location: "", sportTypeId: "", image: null,
    // Add setup for prices and availability bulk creation
    setupPriceAndAvailability: true,
    commonPrice: 100000 
  });

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: "", name: "", location: "", sportTypeId: "", image: null, setupPriceAndAvailability: true, commonPrice: 100000 });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setFormData({ 
      id: item.id, name: item.name, location: item.location, sportTypeId: item.sportTypeId, image: null,
      setupPriceAndAvailability: false, commonPrice: 0 
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.sportTypeId) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    
    setFormError("");
    
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("location", formData.location);
    payload.append("sportTypeId", formData.sportTypeId);
    if (formData.image) payload.append("image", formData.image);

    try {
      if (modalMode === "add") {
        const res = await createCourtMut.mutateAsync(payload);
        const newCourtId = res.data?.id;
        
        // Setup price AND availability dynamically
        if (newCourtId && formData.setupPriceAndAvailability && timeSlots?.length > 0) {
           const pricePromises = timeSlots.map(ts => 
             courtPriceService.createCourtPrice({ courtId: newCourtId, timeSlotId: ts.id, price: formData.commonPrice })
           );
           
           // For simplicity, just setup availability for today
           const today = new Date().toISOString().split('T')[0];
           const availPromises = timeSlots.map(ts => 
             courtAvailabilityService.createOrUpdateAvailability({
               courtId: newCourtId, timeSlotId: ts.id, date: today, isAvailable: true
             })
           );

           await Promise.all([...pricePromises, ...availPromises]);
        }
      } else {
        await updateCourtMut.mutateAsync({ id: formData.id, formData: payload });
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(error?.message || "Có lỗi xảy ra");
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
                <th className="px-6 py-4 font-medium w-16">Hình</th>
                <th className="px-6 py-4 font-medium">Tên Sân</th>
                <th className="px-6 py-4 font-medium">Loại</th>
                <th className="px-6 py-4 font-medium">Trạng Thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courtsLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">Đang tải dữ liệu...</td>
                </tr>
              ) : courts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">Không có bản ghi nào</td>
                </tr>
              ) : (
                courts.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      {item.imageUrl ? (
                        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                           <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 text-xs rounded-md bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border leading-none">No Img</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" /> {item.location || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.sportTypeName || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        item.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} className="text-blue-600 hover:bg-blue-50">Sửa</Button>
                       <Button variant="ghost" size="sm" onClick={() => { if(confirm("Bảo trì sân này?")) maintenanceCourtMut.mutate(item.id) }} className="text-orange-600 hover:bg-orange-50">Bảo trì</Button>
                    </td>
                  </tr>
                ))
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
              <h2 className="text-2xl font-bold text-foreground">{modalMode === "add" ? "Thêm Sân Mới" : "Sửa Sân"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            {formError && <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên sân</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loại môn thể thao</label>
                <select value={formData.sportTypeId} onChange={(e) => setFormData({ ...formData, sportTypeId: e.target.value })} required className="w-full rounded-md border border-input bg-input px-3 py-2">
                  <option value="">-- Chọn Loại Sân --</option>
                  {sportTypes.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium">Vị trí</label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hình ảnh</label>
                <Input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
              </div>
              
              {modalMode === 'add' && (
                <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3 mt-4">
                   <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                     <input type="checkbox" checked={formData.setupPriceAndAvailability} onChange={(e) => setFormData({...formData, setupPriceAndAvailability: e.target.checked})} className="rounded border-border text-primary focus:ring-primary" />
                     Thiết lập Giá và Lịch trống mặc định
                   </label>
                   {formData.setupPriceAndAvailability && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Giá chung cho các khung giờ (VNĐ)</label>
                        <Input type="number" value={formData.commonPrice} onChange={(e) => setFormData({...formData, commonPrice: e.target.value})} />
                      </div>
                   )}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={createCourtMut.isPending || updateCourtMut.isPending}>
                  {createCourtMut.isPending || updateCourtMut.isPending ? "Đang xử lý..." : "Lưu Thay Đổi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
