import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, MessageSquare, User, Calendar, Eye, Reply } from "lucide-react";
import { showToast } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useAllReviewsQuery,
  useReviewMutations,
} from "@/hooks/queries/useReviewQueries";

export default function ReviewManagementPage() {
  const [deleteId, setDeleteId] = useState(null);
  const [viewReview, setViewReview] = useState(null);
  const [replyReview, setReplyReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { data: reviews = [], isLoading } = useAllReviewsQuery();
  const { deleteReviewMut, replyReviewMut } = useReviewMutations();

  const handleDeleteClick = (id) => {
    showToast.confirm(
      "Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.",
      () => {
        deleteReviewMut.mutate(id, {
          onSuccess: () => {
            showToast.success("Đã xóa đánh giá thành công");
          },
          onError: (error) => {
            showToast.error(error.message || "Xóa đánh giá thất bại");
          },
        });
      },
      "Xóa"
    );
  };

  const handleReply = () => {
    if (!replyText.trim()) {
      showToast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    replyReviewMut.mutate(
      { id: replyReview.id, reply: replyText },
      {
        onSuccess: () => {
          showToast.success("Phản hồi thành công");
          setReplyReview(null);
          setReplyText("");
        },
        onError: (error) => {
          showToast.error(error.message || "Phản hồi thất bại");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý đánh giá</h1>
        <p className="text-muted-foreground">
          Xem và quản lý các phản hồi từ khách hàng.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sân</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead className="max-w-[200px]">Nhận xét</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Chưa có đánh giá nào.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{review.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{review.courtName}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-500">
                      {review.rating}
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {review.comment || (
                      <span className="text-muted-foreground italic">
                        (Không có nhận xét)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {review.adminReply ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">Đã phản hồi</Badge>
                    ) : (
                      <Badge variant="secondary">Chờ phản hồi</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => setViewReview(review)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={() => {
                        setReplyReview(review);
                        setReplyText(review.adminReply || "");
                      }}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDeleteClick(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>



      {/* View Detail Modal */}
      <Dialog open={!!viewReview} onOpenChange={() => setViewReview(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
          </DialogHeader>
          {viewReview && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{viewReview.userName}</p>
                    <p className="text-xs text-muted-foreground">{viewReview.courtName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-lg font-bold">{viewReview.rating}</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2">Nhận xét của khách hàng:</p>
                <p className="text-sm leading-relaxed italic">
                  "{viewReview.comment || "Không có nhận xét."}"
                </p>
                <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Gửi ngày {new Date(viewReview.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              {viewReview.adminReply && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-4">
                  <p className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Phản hồi từ Admin:
                  </p>
                  <p className="text-sm leading-relaxed text-emerald-900">
                    {viewReview.adminReply}
                  </p>
                  {viewReview.repliedAt && (
                    <p className="text-[10px] text-emerald-600 mt-4 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Phản hồi ngày {new Date(viewReview.repliedAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReview(null)}>Đóng</Button>
            {!viewReview?.adminReply && (
              <Button onClick={() => {
                setReplyReview(viewReview);
                setReplyText("");
                setViewReview(null);
              }}>
                Phản hồi ngay
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={!!replyReview} onOpenChange={() => setReplyReview(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
          </DialogHeader>
          {replyReview && (
            <div className="space-y-4 pt-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm italic">
                "{replyReview.comment || "Không có nhận xét."}"
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Nội dung phản hồi:</p>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi cho khách hàng..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyReview(null)}>Hủy</Button>
            <Button 
              onClick={handleReply} 
              disabled={replyReviewMut.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {replyReviewMut.isPending ? "Đang gửi..." : "Gửi phản hồi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
