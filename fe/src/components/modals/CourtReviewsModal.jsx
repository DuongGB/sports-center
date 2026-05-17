import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, User, Calendar } from "lucide-react";
import { useCourtReviewsQuery } from "@/hooks/queries/useReviewQueries";

export default function CourtReviewsModal({ isOpen, onClose, court }) {
  const { data: reviews = [], isLoading } = useCourtReviewsQuery(court?.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Đánh giá sân {court?.name}
            {court?.rating > 0 && (
              <div className="flex items-center gap-1 text-amber-500 text-sm ml-2">
                <Star className="h-4 w-4 fill-current" />
                {court.rating}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có đánh giá nào cho sân này.
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{review.userName}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-2">
                  {review.comment || <span className="text-muted-foreground italic text-xs">Không có nhận xét.</span>}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
