import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Loader2 } from "lucide-react";
import { reviewService } from "@/services/reviewService";
import { toast } from "react-toastify";

export default function ViewReviewModal({ isOpen, onClose, booking }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && booking) {
      setLoading(true);
      reviewService.getReviewByBookingId(booking.id)
        .then((res) => {
          if (res.success) {
            setReview(res.data);
          } else {
            toast.error("Không thể tải đánh giá");
            onClose();
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Lỗi khi tải đánh giá");
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, booking, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá sân {booking?.courtName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Đang tải đánh giá...</p>
            </div>
          ) : review ? (
            <>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 ${
                      review.rating >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <div className="w-full space-y-2 mt-4">
                <p className="text-sm font-medium">Nhận xét của bạn</p>
                <div className="p-4 bg-muted/30 rounded-md min-h-[80px] text-sm text-foreground">
                  {review.comment || <span className="text-muted-foreground italic">Không có nhận xét bằng chữ.</span>}
                </div>
              </div>
              
              {review.adminReply && (
                <div className="w-full space-y-2 mt-4">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Phản hồi từ quản trị viên</p>
                  <div className="p-4 border border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10 rounded-md text-sm">
                    {review.adminReply}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Không tìm thấy đánh giá.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
