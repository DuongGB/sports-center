import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSportTypes } from "@/hooks/useSportTypes";
import { useSportTypeMutations } from "@/hooks/queries/useSportTypeQueries";
import { X, Eye, Search, RefreshCcw, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/utils/toast";

export default function SportTypesPage() {
  const queryClient = useQueryClient();
  const [sportTypeFilters, setSportTypeFilters] = useState({ keyword: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const {
    sportTypes,
    loading,
    page,
    totalPages,
    totalElements,
    setPage,
    setFilters,
  } = useSportTypes();
  const { createSportTypeMut, updateSportTypeMut, deleteSportTypeMut } =
    useSportTypeMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit' | 'view'
  const [formData, setFormData] = useState({ id: "", name: "", prices: [] });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setFilters(sportTypeFilters);
  }, [sportTypeFilters, setFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSportTypeFilters({ keyword: searchTerm });
    setPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSportTypeFilters({ keyword: "" });
    setPage(1);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: "", name: "", prices: [] });
    setFormError("");
    setIsModalOpen(true);
  };

  const formatPrices = (prices) => {
    if (!prices) return [];
    return prices.map((p) => ({
      ...p,
      startTime: p.startTime?.substring(0, 5) || "00:00",
      endTime: p.endTime?.substring(0, 5) || "00:00",
      price: p.price || 0,
    }));
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setFormData({
      id: item.id,
      name: item.name,
      prices: formatPrices(item.prices),
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openViewModal = (item) => {
    setModalMode("view");
    setFormData({
      id: item.id,
      name: item.name,
      prices: formatPrices(item.prices),
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!createSportTypeMut.isPending && !updateSportTypeMut.isPending) {
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast.error("Tên môn thể thao không được để trống");
      return;
    }

    const formattedPrices = formData.prices.map((p) => ({
      ...p,
      startTime: p.startTime.substring(0, 5),
      endTime: p.endTime.substring(0, 5),
    }));

    const payload = { name: formData.name.trim(), prices: formattedPrices };

    try {
      if (modalMode === "add") {
        await createSportTypeMut.mutateAsync(payload);
        showToast.success("Thêm loại sân thành công");
      } else {
        await updateSportTypeMut.mutateAsync({
          id: formData.id,
          data: payload,
        });
        showToast.success("Cập nhật loại sân thành công");
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast.error(error?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = (id) => {
    showToast.confirm(
      "Bạn có chắc chắn muốn xóa môn thể thao này?",
      async () => {
        try {
          await deleteSportTypeMut.mutateAsync(id);
          showToast.success("Xóa thành công");
        } catch (error) {
          showToast.error(error?.message || "Xóa thất bại");
        }
      },
      "Xóa",
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Loại Sân Thể Thao
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={() => queryClient.invalidateQueries(["sportTypes"])}
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm tên môn thể thao..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </form>

          {sportTypeFilters.keyword && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-10"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Làm mới
            </Button>
          )}

          <Button onClick={openAddModal} className="h-10 ml-auto sm:ml-0">
            Thêm Mới
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          {loading
            ? "Đang tìm kiếm..."
            : sportTypeFilters.keyword
              ? `Tìm thấy ${totalElements} loại sân phù hợp`
              : `Tổng cộng ${totalElements} loại sân`}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground">
            <thead className="bg-muted/80 text-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên Môn Thể Thao</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="text-muted-foreground">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : sportTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Không có bản ghi nào phù hợp
                  </td>
                </tr>
              ) : (
                sportTypes.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border bg-card gap-4">
            <span className="text-sm text-muted-foreground">
              Hiển thị{" "}
              <span className="font-medium text-foreground">
                {sportTypes.length}
              </span>{" "}
              / {totalElements} kết quả - Trang {page} / {totalPages}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {modalMode === "add"
                  ? "Thêm Loại Sân"
                  : modalMode === "edit"
                    ? "Sửa Loại Sân"
                    : "Chi Tiết Loại Sân"}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={
                  createSportTypeMut.isPending || updateSportTypeMut.isPending
                }
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalMode === "view" && (
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    ID Môn Thể Thao
                  </label>
                  <div className="p-2 border border-border rounded-md bg-muted text-sm break-all">
                    {formData.id}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tên Môn Thể Thao
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value.trimStart(),
                    })
                  }
                  placeholder="Ví dụ: Bóng đá mini"
                  disabled={
                    createSportTypeMut.isPending ||
                    updateSportTypeMut.isPending ||
                    modalMode === "view"
                  }
                  className="border-input bg-input"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Bảng Giá Theo Giờ
                  </label>
                  {modalMode !== "view" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          prices: [
                            ...prev.prices,
                            { startTime: "00:00", endTime: "00:00", price: 0 },
                          ],
                        }))
                      }
                    >
                      Thêm giá
                    </Button>
                  )}
                </div>

                {formData.prices.map((price, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 w-full">
                      <select
                        value={price.startTime.split(":")[0]}
                        onChange={(e) => {
                          const newPrices = [...formData.prices];
                          const m = price.startTime.split(":")[1] || "00";
                          newPrices[index].startTime = `${e.target.value}:${m}`;
                          setFormData({ ...formData, prices: newPrices });
                        }}
                        className="w-full rounded-md border border-input bg-input px-2 py-2 text-sm"
                        disabled={
                          createSportTypeMut.isPending ||
                          updateSportTypeMut.isPending ||
                          modalMode === "view"
                        }
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}h
                          </option>
                        ))}
                      </select>
                      <select
                        value={price.startTime.split(":")[1] || "00"}
                        onChange={(e) => {
                          const newPrices = [...formData.prices];
                          const h = price.startTime.split(":")[0] || "00";
                          newPrices[index].startTime = `${h}:${e.target.value}`;
                          setFormData({ ...formData, prices: newPrices });
                        }}
                        className="w-full rounded-md border border-input bg-input px-2 py-2 text-sm"
                        disabled={
                          createSportTypeMut.isPending ||
                          updateSportTypeMut.isPending ||
                          modalMode === "view"
                        }
                      >
                        {["00", "15", "30", "45"].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="flex items-center gap-1 w-full">
                      <select
                        value={price.endTime.split(":")[0]}
                        onChange={(e) => {
                          const newPrices = [...formData.prices];
                          const m = price.endTime.split(":")[1] || "00";
                          newPrices[index].endTime = `${e.target.value}:${m}`;
                          setFormData({ ...formData, prices: newPrices });
                        }}
                        className="w-full rounded-md border border-input bg-input px-2 py-2 text-sm"
                        disabled={
                          createSportTypeMut.isPending ||
                          updateSportTypeMut.isPending ||
                          modalMode === "view"
                        }
                      >
                        {Array.from({ length: 25 }).map((_, i) => (
                          <option
                            key={i}
                            value={
                              i === 24 ? "23" : i.toString().padStart(2, "0")
                            }
                          >
                            {i === 24 ? "24" : i.toString().padStart(2, "0")}h
                          </option>
                        ))}
                      </select>
                      <select
                        value={price.endTime.split(":")[1] || "00"}
                        onChange={(e) => {
                          const newPrices = [...formData.prices];
                          const h = price.endTime.split(":")[0] || "00";
                          newPrices[index].endTime = `${h}:${e.target.value}`;
                          setFormData({ ...formData, prices: newPrices });
                        }}
                        className="w-full rounded-md border border-input bg-input px-2 py-2 text-sm"
                        disabled={
                          createSportTypeMut.isPending ||
                          updateSportTypeMut.isPending ||
                          modalMode === "view"
                        }
                      >
                        {["00", "15", "30", "45"].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={price.price}
                      onChange={(e) => {
                        const newPrices = [...formData.prices];
                        newPrices[index].price = Number(e.target.value);
                        setFormData({ ...formData, prices: newPrices });
                      }}
                      placeholder="Giá (VNĐ)"
                      disabled={
                        createSportTypeMut.isPending ||
                        updateSportTypeMut.isPending ||
                        modalMode === "view"
                      }
                      className="w-full"
                    />
                    {modalMode !== "view" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => {
                          const newPrices = formData.prices.filter(
                            (_, i) => i !== index,
                          );
                          setFormData({ ...formData, prices: newPrices });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {formData.prices.length === 0 && (
                  <div className="text-sm text-muted-foreground italic border border-dashed border-border rounded-md p-4 text-center">
                    Chưa có khung giá nào.
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant={modalMode === "view" ? "default" : "outline"}
                  onClick={handleCloseModal}
                  disabled={
                    createSportTypeMut.isPending || updateSportTypeMut.isPending
                  }
                >
                  {modalMode === "view" ? "Đóng" : "Hủy"}
                </Button>
                {modalMode !== "view" && (
                  <Button
                    type="submit"
                    disabled={
                      createSportTypeMut.isPending ||
                      updateSportTypeMut.isPending
                    }
                  >
                    {createSportTypeMut.isPending ||
                    updateSportTypeMut.isPending
                      ? "Đang lưu..."
                      : "Lưu Thay Đổi"}
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
