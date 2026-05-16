import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import { useReviewMutations } from "@/hooks/queries/useReviewQueries";
import { reviewService } from "@/services/reviewService";

export default function ReviewModal({ isOpen, onClose, booking, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewId, setReviewId] = useState(null);
  const { createReviewMut, updateReviewMut } = useReviewMutations();

  useEffect(() => {
    if (isOpen && booking?.isReviewed) {
      reviewService.getReviewByBookingId(booking.id).then((res) => {
        if (res.success) {
          setRating(res.data.rating);
          setComment(res.data.comment || "");
          setReviewId(res.data.id);
        }
      });
    } else if (isOpen) {
      setRating(0);
      setComment("");
      setReviewId(null);
    }
  }, [isOpen, booking]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (booking.isReviewed && reviewId) {
      updateReviewMut.mutate({
        id: reviewId,
        data: {
          bookingId: booking.id,
          rating,
          comment,
        }
      }, {
        onSuccess: () => {
          toast.success("Cập nhật đánh giá thành công!");
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Cập nhật thất bại");
        }
      });
    } else {
      createReviewMut.mutate({
        bookingId: booking.id,
        rating,
        comment,
      }, {
        onSuccess: () => {
          toast.success("Cảm ơn bạn đã đánh giá!");
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Đánh giá thất bại");
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{booking?.isReviewed ? "Cập nhật" : "Đánh giá"} sân {booking?.courtName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Chia sẻ trải nghiệm của bạn về chất lượng sân và dịch vụ tại đây.
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="transition-transform hover:scale-110 active:scale-95"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`h-8 w-8 ${
                    (hover || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">Nhận xét (không bắt buộc)</label>
            <Textarea
              placeholder="Nhập nhận xét của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={createReviewMut.isPending || updateReviewMut.isPending}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={createReviewMut.isPending || updateReviewMut.isPending}>
            {createReviewMut.isPending || updateReviewMut.isPending ? "Đang gửi..." : (booking?.isReviewed ? "Cập nhật" : "Gửi đánh giá")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
