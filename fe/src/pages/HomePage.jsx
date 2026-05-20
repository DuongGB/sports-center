import { useMemo, useState, useEffect } from "react";
import { useCourts } from "@/hooks/useCourts";
import { useSportTypes } from "@/hooks/useSportTypes";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Dumbbell,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import CourtReviewsModal from "@/components/modals/CourtReviewsModal";
import { useActiveEventsQuery } from "@/hooks/queries/useEventQueries";
import { useMyBookingsQuery } from "@/hooks/queries/useBookingQueries";

const navLinks = [
  { label: "Trang chủ", href: "#home" },
  { label: "Đặt sân", href: "#booking" },
  { label: "Sân thể thao", href: "#sports" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "Liên hệ", href: "#contact" },
];



const pricePlans = [
  {
    title: "Giờ thấp điểm",
    price: "Từ 90.000đ",
    note: "Phù hợp buổi sáng và đầu giờ chiều.",
  },
  {
    title: "Giờ tiêu chuẩn",
    price: "Từ 150.000đ",
    note: "Khung giờ linh hoạt trong ngày.",
  },
  {
    title: "Giải đấu / nhóm",
    price: "Theo gói",
    note: "Ưu đãi cho đặt nhiều sân cùng lúc.",
  },
];

// stats will be defined inside HomePage to use dynamic data

function statusLabel(status) {
  if (status === "available") return "Có sẵn";
  if (status === "maintenance") return "Bảo trì";
  return "Đang cập nhật";
}

function statusStyles(status) {
  if (status === "available") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (status === "maintenance") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "border-border bg-muted text-muted-foreground";
}

export default function HomePage({
  user,
  isAuthenticated,
  onLoginClick,
  onRegisterClick,
}) {
  const [search, setSearch] = useState({
    keyword: "",
    sport: "all",
    time: "18:00",
    date: "",
    courtName: "",
    location: "",
  });

  const navigate = useNavigate();
  const { data: myBookingsData } = useMyBookingsQuery(1, 8, { enabled: isAuthenticated });
  const recentBookings = useMemo(() => {
    if (!myBookingsData) return [];
    const bookingsList = Array.isArray(myBookingsData) ? myBookingsData : (myBookingsData.data || []);
    return bookingsList.slice(0, 3);
  }, [myBookingsData]);

  const [selectedCourtForReviews, setSelectedCourtForReviews] = useState(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const { data: activeEvents = [] } = useActiveEventsQuery();




  const { courts, loading: courtsLoading, page, totalPages, totalElements: totalCourts, setPage, setFilters } = useCourts();
  const { sportTypes, loading: sportTypesLoading, totalElements: totalSportTypes } = useSportTypes();

  const stats = [
    { value: `${totalCourts}+`, label: "Sân đang hoạt động" },
    { value: totalSportTypes, label: "Môn thể thao phổ biến" },
    { value: "98%", label: "Khách hàng hài lòng" },
    { value: "24/7", label: "Hỗ trợ đặt sân" },
  ];

  // Data fetching is now handled automatically by useCourts and useSportTypes hooks using React Query
  // with built-in caching and deduplication.

  const getSportIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("cầu lông")) return "🏸";
    if (nameLower.includes("bóng đá")) return "⚽";
    if (nameLower.includes("bóng chuyền")) return "🏐";
    if (nameLower.includes("pickleball")) return "🥒";
    if (nameLower.includes("bóng bàn")) return "🏓";
    if (nameLower.includes("bóng rổ")) return "🏀";
    if (nameLower.includes("tennis") || nameLower.includes("quần vợt")) return "🎾";
    return "🎯";
  };

  const calculateDiscountedPrice = (court, events) => {
    if (!events || events.length === 0) return null;

    let bestDiscount = null;
    const originalPrice = court.prices && court.prices.length > 0 ? court.prices[0].price : 0;
    if (originalPrice === 0) return null;

    events.forEach(event => {
      // Check if this event applies to this court
      const applies = event.scope === "ALL_COURTS" || event.targets?.some(target => 
        target.courtId === court.id || target.sportTypeId === court.sportTypeId
      );

      if (applies) {
        let currentFinalPrice = originalPrice;
        let discountVal = 0;

        if (event.type === "DISCOUNT_PERCENT") {
          discountVal = (originalPrice * event.discountPercent) / 100;
          currentFinalPrice = originalPrice - discountVal;
        } else if (event.type === "DISCOUNT_FIXED") {
          discountVal = event.discountAmount;
          currentFinalPrice = originalPrice - discountVal;
        }

        if (currentFinalPrice < (bestDiscount?.finalPrice ?? Infinity)) {
          bestDiscount = { 
            type: event.type, 
            value: event.type === "DISCOUNT_PERCENT" ? event.discountPercent : event.discountAmount,
            finalPrice: Math.max(0, currentFinalPrice),
            originalPrice
          };
        }
      }
    });

    return bestDiscount;
  };

  const displaySports = sportTypes.map(st => ({

    id: st.id,
    name: st.name,
    icon: getSportIcon(st.name),
    description: "Khám phá sân chơi chất lượng cao và cơ sở vật chất tuyệt vời.",
  }));

  const displayCourts = courts.map(court => {
    const discountInfo = calculateDiscountedPrice(court, activeEvents);
    
    return {
      id: court.id,
      name: court.name,
      sport: court.sportTypeName || "Khác",
      price: court.prices && court.prices.length > 0 
        ? `${court.prices[0].price.toLocaleString()}đ/giờ` 
        : "Liên hệ",
      originalPrice: court.prices && court.prices.length > 0 ? court.prices[0].price : 0,
      discountInfo,
      location: court.location,
      status: court.status === "ACTIVE" ? "available" : court.status === "MAINTENANCE" ? "maintenance" : "inactive",
      rating: court.averageRating || 0,
      totalReviews: court.totalReviews || 0,
      image: court.courtImages && court.courtImages.length > 0 
        ? court.courtImages[0] 
        : "https://images.unsplash.com/photo-1587280501635-3953384038ce?q=80&w=2070&auto=format&fit=crop",
      tags: ["Mới cập nhật", "Giữ chỗ nhanh"],
    };
  });


  const featuredCount = courts.length;

  const handleSearchClick = () => {
    const apiFilters = {
      status: "ACTIVE",
      keyword: search.keyword.trim(),
      sportTypeId: search.sport === "all" ? "" : search.sport,
    };
    
    // Also include location/courtName in keyword if not empty
    if (search.location.trim()) {
      apiFilters.keyword = apiFilters.keyword 
        ? `${apiFilters.keyword} ${search.location.trim()}`
        : search.location.trim();
    }
    
    setFilters(apiFilters);
    setPage(1);

    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-ice-gradient text-foreground">
      {/* Side Banners - Only visible on very large screens */}
      <div className="side-banner side-banner-left">
        <div className="banner-content group relative cursor-pointer">
          <img 
            src="/sports_gear_banner_1778866716963.png" 
            alt="Ad Left" 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-4 left-0 w-full text-center text-[10px] font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            Trang bị mới
          </div>
        </div>
      </div>
      
      <div className="side-banner side-banner-right">
        <div className="banner-content group relative cursor-pointer">
          <img 
            src="/booking_discount_banner_1778866731696.png" 
            alt="Ad Right" 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-4 left-0 w-full text-center text-[10px] font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            Ưu đãi đặt sân
          </div>
        </div>
      </div>

      <main id="home">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 hero-3d-bg grid-pattern" />
          {/* Floating 3D sport emojis */}
          <div className="absolute top-20 left-[8%] text-5xl floating opacity-60 pointer-events-none select-none" aria-hidden="true">⚽</div>
          <div className="absolute top-40 right-[12%] text-4xl floating-reverse opacity-50 pointer-events-none select-none" aria-hidden="true">🏸</div>
          <div className="absolute bottom-20 left-[15%] text-4xl floating-slow opacity-40 pointer-events-none select-none" aria-hidden="true">🎾</div>
          <div className="absolute bottom-32 right-[20%] text-5xl floating opacity-30 pointer-events-none select-none" aria-hidden="true">🏀</div>
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="slide-up mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary shimmer">
                <Sparkles className="h-4 w-4" />
                Đặt sân nhanh trong vài giây
              </div>

              {/* Event Banners */}
              {activeEvents.length > 0 && (
                <div className="slide-up-d1 mb-6 grid gap-3 max-w-2xl">
                  {activeEvents.map((ev, i) => (
                    <div key={ev.id} className="relative overflow-hidden glass-card rounded-xl border border-primary/30 p-3 depth-shadow group" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary floating">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">{ev.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{ev.description || "Ưu đãi đặc biệt đang diễn ra"}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0 ml-13 sm:ml-0">
                          {ev.type === "DISCOUNT_PERCENT" && (
                            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-3 py-1 shadow-lg">
                              Giảm {ev.discountPercent}%
                            </Badge>
                          )}
                          {ev.type === "DISCOUNT_FIXED" && (
                            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-3 py-1 shadow-lg">
                              Giảm {Number(ev.discountAmount).toLocaleString("vi-VN")}đ
                            </Badge>
                          )}
                          {ev.type === "BLOCK_BOOKING" && (
                            <Badge variant="destructive" className="text-sm font-bold px-3 py-1">
                              Thông báo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h1 className="slide-up-d1 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Nền tảng đặt sân thể thao đa môn cho <span className="gradient-text">người chơi hiện đại.</span>
              </h1>

              <p className="slide-up-d2 mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Tìm sân nhanh, xem lịch trống theo thời gian thực, đặt chỗ đơn
                giản và quản lý mọi thứ trên một trải nghiệm thương mại mượt mà,
                tối ưu cho mobile, tablet và desktop.
              </p>

              <div className="slide-up-d3 mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 btn-neon">
                  <a href="#booking">
                    Đặt sân ngay
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="glass-card border-primary/20">
                  <a href="#sports">Khám phá môn thể thao</a>
                </Button>
              </div>

              <div className="slide-up-d4 mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item, i) => (
                  <div
                    key={item.label}
                    className="glass-card rounded-2xl p-5 gradient-border"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="text-2xl font-bold gradient-text">{item.value}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-6">
              <Card className="perspective-stage overflow-hidden glass-card depth-shadow rounded-2xl">
                <CardHeader className="space-y-2 border-b border-border/60 bg-muted/30">
                  <CardTitle className="text-xl">
                    Tìm sân phù hợp trong vài bước
                  </CardTitle>
                  <CardDescription>
                    Chọn môn thể thao, khung giờ và ngày đặt sân.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Từ khóa</label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search.keyword}
                        onChange={(e) =>
                          setSearch((prev) => ({
                            ...prev,
                            keyword: e.target.value,
                          }))
                        }
                        placeholder="Tên sân, khu vực, môn thể thao..."
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Môn thể thao
                      </label>
                      <Select
                        value={search.sport}
                        onValueChange={(value) =>
                          setSearch((prev) => ({
                            ...prev,
                            sport: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Chọn môn thể thao" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả môn</SelectItem>
                          {displaySports.map((sport) => (
                            <SelectItem key={sport.id} value={sport.id}>
                              {sport.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Giờ muốn đặt
                      </label>
                      <Input
                        type="time"
                        value={search.time}
                        onChange={(e) =>
                          setSearch((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tên sân</label>
                      <Input
                        value={search.courtName}
                        onChange={(e) =>
                          setSearch((prev) => ({
                            ...prev,
                            courtName: e.target.value,
                          }))
                        }
                        placeholder="VD: Sân A1..."
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Khu vực</label>
                      <Input
                        value={search.location}
                        onChange={(e) =>
                          setSearch((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="VD: Quận 1..."
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày đặt sân</label>
                    <Input
                      type="date"
                      value={search.date}
                      onChange={(e) =>
                        setSearch((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="h-11"
                    />
                  </div>

                  <Button className="h-11 w-full gap-2" onClick={handleSearchClick}>
                    <CalendarDays className="h-4 w-4" />
                    Tìm sân trống ngay
                  </Button>

                  <div className="grid gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Định vị nhanh</p>
                        <p className="text-xs text-muted-foreground">
                          Chọn sân theo khu vực gần bạn.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Xem lịch trống</p>
                        <p className="text-xs text-muted-foreground">
                          Cập nhật trạng thái theo thời gian thực.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Recent Bookings Section (Only for logged in users) */}
        {isAuthenticated && recentBookings.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-b border-border/40">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Lịch sử đặt sân gần đây</h2>
                <p className="text-sm text-muted-foreground">Các hoạt động mới nhất của bạn trên hệ thống.</p>
              </div>
              <Button asChild variant="link" size="sm">
                <Link to="/my-bookings">Xem tất cả</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentBookings.map((booking) => (
                <Card key={booking.id} className="bg-card/50 hover:bg-card transition-colors cursor-pointer" onClick={() => navigate("/my-bookings")}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {booking.courtName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{booking.courtName}</p>
                        <p className="text-xs text-muted-foreground">{booking.bookingDate} • {booking.startTime.slice(0,5)}</p>
                      </div>
                    </div>
                    {booking.bookingStatus === "COMPLETED" && !booking.isReviewed && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] px-2 py-0">Đánh giá</Badge>
                    )}
                    {booking.bookingStatus === "COMPLETED" && booking.isReviewed && (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Glow Divider */}
        <div className="section-glow-divider mx-auto max-w-4xl" />

        {/* Sports Categories */}
        <section
          id="sports"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Môn thể thao</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Đa dạng lựa chọn cho từng nhu cầu chơi
              </h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <a href="#booking">
                Xem sân nổi bật
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sportTypesLoading ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                Đang tải danh sách môn thể thao...
              </div>
            ) : (
              displaySports.map((sport) => (
                <div
                  key={sport.name}
                  className="card-3d group"
                >
                  <div className="card-3d-inner glass-card rounded-2xl p-6 gradient-border">
                    <div className="flex items-start gap-4">
                      <div className="sport-icon-3d h-14 w-14 text-3xl">
                        {sport.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{sport.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {sport.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section Glow Divider */}
        <div className="section-glow-divider mx-auto max-w-4xl" />

        {/* Featured Courts */}
        <section
          id="booking"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Danh sách sân bãi</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {courtsLoading ? "Đang tải danh sách sân..." : `Khám phá các sân chơi phù hợp`}
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Danh sách dưới đây được thiết kế như một trải nghiệm thương mại:
                ảnh lớn, thông tin rõ ràng, trạng thái dễ đọc và CTA nổi bật.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch({
                    keyword: "",
                    sport: "all",
                    time: "18:00",
                    date: "",
                    courtName: "",
                    location: "",
                  });
                  setFilters({ status: "ACTIVE" });
                  setPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
              <Button onClick={() => navigate("/booking")}>Đặt sân ngay</Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courtsLoading ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Đang tải danh sách sân...
              </div>
            ) : displayCourts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Không tìm thấy sân phù hợp với bộ lọc.
              </div>
            ) : (
              displayCourts.map((court) => (
              <div
                key={court.id}
                className="card-3d group overflow-hidden rounded-2xl glass-card depth-shadow"
              >
                <div 
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/court/${court.id}`)}
                >
                  <img
                    src={court.image}
                    alt={court.name}
                    className="h-full w-full object-cover parallax-zoom"
                  />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur ${statusStyles(
                        court.status,
                      )}`}
                    >
                      {statusLabel(court.status)}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {court.sport}
                  </div>
                </div>

                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="cursor-pointer" onClick={() => navigate(`/court/${court.id}`)}>
                      <CardTitle className="text-xl hover:text-primary transition-colors">{court.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {court.location}
                      </CardDescription>
                    </div>
                    <div 
                      className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300 cursor-pointer hover:bg-amber-500/20 transition-colors"
                      onClick={() => {
                        setSelectedCourtForReviews(court);
                        setIsReviewsModalOpen(true);
                      }}
                    >
                      <Star className="h-4 w-4 fill-current" />
                      {court.rating} {court.totalReviews > 0 && <span className="text-xs opacity-70">({court.totalReviews})</span>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {court.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Giá thuê</p>
                      {court.discountInfo ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                            {court.price}
                          </span>
                          <p className="text-xl font-bold gradient-text-emerald">
                            {court.discountInfo.finalPrice.toLocaleString()}đ/giờ
                          </p>
                        </div>
                      ) : (
                        <p className="text-xl font-semibold gradient-text-emerald">
                          {court.price}
                        </p>
                      )}
                    </div>


                    <Button
                      disabled={court.status !== "available"}
                      onClick={() => {
                        navigate(`/booking?courtId=${court.id}`);
                      }}
                    >
                      {court.status === "available" ? "Đặt ngay" : "Tạm dừng"}
                    </Button>
                  </div>
                </CardContent>
              </div>
            )))}
          </div>

          {!courtsLoading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                Trang {page} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
              >
                Tiếp
              </Button>
            </div>
          )}
        </section>

        {/* Section Glow Divider */}
        <div className="section-glow-divider mx-auto max-w-4xl" />

        {/* Pricing Section */}
        <section
          id="pricing"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        >
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">Bảng giá</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Linh hoạt theo khung giờ và nhu cầu
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {pricePlans.map((plan, i) => (
              <div key={plan.title} className={`card-3d ${i === 1 ? 'scale-105 z-10' : ''}`}>
                <div className={`card-3d-inner glass-card rounded-2xl p-6 space-y-3 gradient-border ${i === 1 ? 'ring-2 ring-primary/20' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="sport-icon-3d h-10 w-10">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{plan.title}</h3>
                  </div>
                  <div className="text-3xl font-bold gradient-text">
                    {plan.price}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {plan.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-[2rem] glass-card p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10 gradient-border">
            <div>
              <p className="text-sm font-medium text-primary">
                Tại sao chọn chúng tôi
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Trải nghiệm đặt sân được thiết kế để chuyển đổi
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Giao diện tập trung vào tốc độ đặt sân, độ tin cậy và khả năng
                đọc rõ ràng trên mọi kích thước màn hình. Đây là kiểu bố cục bạn
                thường thấy ở website thương mại hiện đại.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 glass-card rounded-2xl p-4">
                  <div className="sport-icon-3d rounded-xl p-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Phù hợp nhóm bạn</p>
                    <p className="text-sm text-muted-foreground">
                      Đặt lẻ hoặc đặt theo nhóm đều nhanh gọn.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 glass-card rounded-2xl p-4">
                  <div className="sport-icon-3d rounded-xl p-2">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Chất lượng sân tốt</p>
                    <p className="text-sm text-muted-foreground">
                      Có trạng thái rõ ràng, ảnh lớn, dễ đánh giá.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="glass-card rounded-2xl p-5 gradient-border">
                <p className="text-sm text-muted-foreground">
                  Tính năng nổi bật
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="sport-icon-3d rounded-xl p-2">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Đặt sân theo giờ thực tế</p>
                    <p className="text-sm text-muted-foreground">
                      Lựa chọn thời gian linh hoạt, dễ mở rộng thành booking
                      flow.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 gradient-border">
                <div className="flex items-center gap-3">
                  <div className="sport-icon-3d rounded-xl p-2">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Tốc độ và rõ ràng</p>
                    <p className="text-sm text-muted-foreground">
                      CTA nổi bật, điều hướng ngắn, ưu tiên chuyển đổi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section
          id="contact"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="rounded-[2rem] glass-card p-6 sm:p-8 lg:p-10 gradient-border relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-6 right-8 text-4xl floating-slow opacity-20 pointer-events-none select-none" aria-hidden="true">🏆</div>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-medium text-primary">Liên hệ</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Sẵn sàng đặt sân cho buổi chơi tiếp theo?
                </h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Đội ngũ D-Sport Center luôn sẵn sàng hỗ trợ chọn sân, kiểm tra
                  lịch trống và tư vấn dịch vụ phù hợp cho nhóm của bạn.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="btn-neon">
                    <a href="#booking">Xem sân trống</a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="glass-card">
                    <a href="tel:0356309561">Gọi tư vấn</a>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground">Hotline</p>
                  <p className="mt-2 text-lg font-semibold">0356 309 561</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="mt-2 text-lg font-semibold">
                    contact@sportscenter.vn
                  </p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="mt-2 text-lg font-semibold">
                    123 Đường ABC, Quận 1, TP.HCM
                  </p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground">Hỗ trợ</p>
                  <p className="mt-2 text-lg font-semibold">24/7 Online</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-border/60 hero-3d-bg">
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-neon">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold">D-Sport Center</p>
                  <p className="text-sm text-muted-foreground">
                    D-Sport Center Booking System
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                Nền tảng đặt sân thể thao đa môn, tối ưu trải nghiệm người dùng
                và hướng tới chuyển đổi thực tế như một website thương mại.
              </p>
            </div>

            <div>
              <p className="font-semibold">Điều hướng</p>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <a href="#home" className="hover:text-foreground">
                  Trang chủ
                </a>
                <a href="#booking" className="hover:text-foreground">
                  Đặt sân
                </a>
                <a href="#sports" className="hover:text-foreground">
                  Sân thể thao
                </a>
                <a href="#pricing" className="hover:text-foreground">
                  Bảng giá
                </a>
              </div>
            </div>

            <div>
              <p className="font-semibold">Tài khoản</p>
              {!isAuthenticated && (
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" onClick={onLoginClick}>
                    Đăng nhập
                  </Button>
                  <Button onClick={onRegisterClick}>Đăng ký</Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t section-glow-divider pt-6 text-sm text-muted-foreground">
            © 2026 D-Sport Center. All rights reserved.
          </div>
        </div>
      </footer>
      {selectedCourtForReviews && (
        <CourtReviewsModal
          isOpen={isReviewsModalOpen}
          onClose={() => setIsReviewsModalOpen(false)}
          court={selectedCourtForReviews}
        />
      )}
    </div>
  );
}
