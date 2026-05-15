import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCourtQuery } from "@/hooks/queries/useCourtQueries";
import { useCourtReviewsQuery } from "@/hooks/queries/useReviewQueries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  MapPin,
  Clock3,
  Calendar,
  ChevronLeft,
  User,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CourtDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: court,
    isLoading: courtLoading,
    isError: courtError,
  } = useCourtQuery(id);
  const { data: reviews = [], isLoading: reviewsLoading } =
    useCourtReviewsQuery(id);

  const [activeEvents, setActiveEvents] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    import("@/services/eventService").then(({ eventService }) => {
      eventService.getActiveEvents().then(res => {
        setActiveEvents(res.data || []);
      }).catch(console.error);
    });
  }, [id]);

  const calculateDiscountedPrice = (court, events) => {
    if (!court || !events || events.length === 0) return null;
    const originalPrice = court.prices && court.prices.length > 0 ? court.prices[0].price : 0;
    if (originalPrice === 0) return null;

    let bestFinalPrice = originalPrice;
    let hasDiscount = false;

    events.forEach(event => {
      const applies = event.scope === "ALL_COURTS" || event.targets?.some(target => 
        target.courtId === court.id || target.sportTypeId === court.sportTypeId
      );

      if (applies) {
        let currentFinalPrice = originalPrice;
        if (event.type === "DISCOUNT_PERCENT") {
          currentFinalPrice = originalPrice * (1 - event.discountPercent / 100);
        } else if (event.type === "DISCOUNT_FIXED") {
          currentFinalPrice = originalPrice - event.discountAmount;
        }
        if (currentFinalPrice < bestFinalPrice) {
          bestFinalPrice = Math.max(0, currentFinalPrice);
          hasDiscount = true;
        }
      }
    });

    return hasDiscount ? bestFinalPrice : null;
  };

  const discountedPrice = calculateDiscountedPrice(court, activeEvents);
  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  if (courtLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">
            Đang tải thông tin sân...
          </p>
        </div>
      </div>
    );
  }

  if (courtError || !court) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center">
          <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy sân</h2>
          <p className="text-muted-foreground mb-6">
            Thông tin sân bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const mainImage =
    court.courtImages?.[0] ||
    "https://images.unsplash.com/photo-1587280501635-3953384038ce?q=80&w=2070&auto=format&fit=crop";
  const otherImages = court.courtImages?.slice(1) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header / Navigation */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 h-16 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold line-clamp-1">{court.name}</h1>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left Column: Images & Reviews */}
          <div className="space-y-12">
            {/* Image Gallery */}
            <section className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-lg">
                <img
                  src={mainImage}
                  alt={court.name}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur text-sm py-1.5">
                  {court.sportTypeName}
                </Badge>
              </div>

              {otherImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {otherImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square overflow-hidden rounded-2xl border border-border/60 shadow-sm transition-transform hover:scale-95 cursor-pointer"
                    >
                      <img
                        src={img}
                        alt={`${court.name} ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* About Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  Chi tiết sân
                </h2>
                <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-amber-700 dark:text-amber-300">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold">
                    {court.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-xs opacity-70">
                    ({court.totalReviews} đánh giá)
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Chào mừng bạn đến với <strong>{court.name}</strong>, một trong
                những cơ sở thể thao hàng đầu tại {court.location}. Sân được bảo
                trì thường xuyên với mặt sân chất lượng cao, hệ thống chiếu sáng
                hiện đại và dịch vụ hỗ trợ chuyên nghiệp, đảm bảo trải nghiệm
                tốt nhất cho mọi trận đấu của bạn.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/30">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Vị trí</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {court.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/30">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Clock3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Thời gian hoạt động</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {court.openTime?.slice(0, 5)} -{" "}
                      {court.closeTime?.slice(0, 5)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-2xl font-bold">Đánh giá từ cộng đồng</h2>
                <Button variant="outline" size="sm" className="rounded-full">
                  Lọc đánh giá
                </Button>
              </div>

              {reviewsLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">
                    Đang tải đánh giá...
                  </p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-[2rem] border-2 border-dashed border-border/60">
                  <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Chưa có đánh giá nào</h3>
                  <p className="text-muted-foreground mt-1">
                    Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nghĩ về sân
                    này.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {displayReviews.map((review) => (
                    <Card
                      key={review.id}
                      className="border-none bg-muted/20 shadow-none transition-all hover:bg-muted/40 rounded-2xl overflow-hidden"
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {review.userName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">
                                {review.userName}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(review.createdAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-sm leading-relaxed text-foreground/90 pl-1">
                          {review.comment || (
                            <span className="text-muted-foreground italic text-xs">
                              Người dùng không để lại nhận xét.
                            </span>
                          )}
                        </p>

                        {review.adminReply && (
                          <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-4 ml-2">
                            <p className="text-xs font-bold text-primary mb-1 flex items-center gap-2">
                              <MessageSquare className="h-3 w-3" />
                              Phản hồi từ chủ sân
                            </p>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {review.adminReply}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {reviews.length > 5 && (
                    <div className="pt-4 text-center">
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full"
                      >
                        {showAllReviews ? "Thu gọn đánh giá" : `Xem thêm ${reviews.length - 5} đánh giá`}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Pricing & Booking CTA */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="overflow-hidden border-border/60 bg-card/90 shadow-xl shadow-black/5 rounded-[2rem]">
              <div className="bg-primary/5 p-8 border-b border-border/60">
                <p className="text-sm font-medium text-primary mb-1">
                  Giá thuê từ
                </p>
                <div className="flex flex-col">
                  {discountedPrice != null ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">
                          {discountedPrice.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          vnđ/giờ
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground line-through mt-1">
                        {court.prices?.[0]?.price?.toLocaleString()} vnđ
                      </span>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">
                        {court.prices?.[0]?.price?.toLocaleString() || "Liên hệ"}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        vnđ/giờ
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    Dịch vụ bao gồm
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Nước uống miễn phí",
                      "WiFi tốc độ cao",
                      "Chỗ để xe an toàn",
                      "Phòng tắm & thay đồ",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    disabled={court.status !== "ACTIVE"}
                    onClick={() => navigate(`/booking?courtId=${court.id}`)}
                  >
                    {court.status === "ACTIVE" ? (
                      <>
                        Đặt sân ngay
                        <ArrowRight className="h-5 w-5" />
                      </>
                    ) : (
                      "Sân hiện đang bảo trì"
                    )}
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground">
                    Bằng cách đặt sân, bạn đồng ý với Điều khoản & Quy định của
                    chúng tôi.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 grid gap-4">
              <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/30 p-5">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Cần hỗ trợ?</p>
                  <p className="text-xs text-muted-foreground">
                    Liên hệ chủ sân: 0356 309 561
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
