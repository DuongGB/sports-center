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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Dumbbell,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

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

const stats = [
  { value: "120+", label: "Sân đang hoạt động" },
  { value: "6", label: "Môn thể thao phổ biến" },
  { value: "98%", label: "Khách hàng hài lòng" },
  { value: "24/7", label: "Hỗ trợ đặt sân" },
];

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
  });

  const navigate = useNavigate();

  const { courts, fetchCourts, loading: courtsLoading, page, totalPages, setPage } = useCourts();
  const { sportTypes, fetchSportTypes, loading: sportTypesLoading } = useSportTypes();

  useEffect(() => {
    fetchCourts(page, 6, { status: "ACTIVE" });
  }, [fetchCourts, page]);

  useEffect(() => {
    fetchSportTypes(1, 20);
  }, [fetchSportTypes]);

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

  const displaySports = sportTypes.map(st => ({
    name: st.name,
    icon: getSportIcon(st.name),
    description: "Khám phá sân chơi chất lượng cao và cơ sở vật chất tuyệt vời.",
  }));

  const displayCourts = courts.map(court => ({
    id: court.id,
    name: court.name,
    sport: court.sportTypeName || "Khác",
    price: court.prices && court.prices.length > 0 
      ? `${court.prices[0].price.toLocaleString()}đ/giờ` 
      : "Liên hệ",
    location: court.location,
    status: court.status === "ACTIVE" ? "available" : court.status === "MAINTENANCE" ? "maintenance" : "inactive",
    rating: 4.8,
    image: court.courtImages && court.courtImages.length > 0 
      ? court.courtImages[0] 
      : "https://images.unsplash.com/photo-1587280501635-3953384038ce?q=80&w=2070&auto=format&fit=crop",
    tags: ["Mới cập nhật", "Giữ chỗ nhanh"],
  }));

  const filteredCourts = useMemo(() => {
    return displayCourts.filter((court) => {
      const keywordMatch =
        search.keyword.trim() === "" ||
        court.name.toLowerCase().includes(search.keyword.toLowerCase()) ||
        court.sport.toLowerCase().includes(search.keyword.toLowerCase()) ||
        court.location.toLowerCase().includes(search.keyword.toLowerCase());

      const sportMatch = search.sport === "all" || court.sport === search.sport;

      return keywordMatch && sportMatch;
    });
  }, [search.keyword, search.sport, displayCourts]);

  const featuredCount = filteredCourts.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="home">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(to_bottom,_transparent,_transparent_60%,rgba(2,6,23,0.02))]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Đặt sân nhanh trong vài giây
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Nền tảng đặt sân thể thao đa môn cho người chơi hiện đại.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Tìm sân nhanh, xem lịch trống theo thời gian thực, đặt chỗ đơn
                giản và quản lý mọi thứ trên một trải nghiệm thương mại mượt mà,
                tối ưu cho mobile, tablet và desktop.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <a href="#booking">
                    Đặt sân ngay
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#sports">Khám phá môn thể thao</a>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                  <Card
                    key={item.label}
                    className="border-border/60 bg-card/80"
                  >
                    <CardContent className="p-5">
                      <div className="text-2xl font-semibold">{item.value}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:pl-6">
              <Card className="overflow-hidden border-border/60 bg-card/90 shadow-2xl shadow-black/5">
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
                            <SelectItem key={sport.name} value={sport.name}>
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

                  <Button className="h-11 w-full gap-2" onClick={() => {
                    const el = document.getElementById('booking');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}>
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

        {/* Sports Categories */}
        <section
          id="sports"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
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
                <Card
                  key={sport.name}
                  className="group border-border/60 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                        {sport.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{sport.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {sport.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

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
                onClick={() =>
                  setSearch({
                    keyword: "",
                    sport: "all",
                    time: "18:00",
                    date: "",
                  })
                }
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
            ) : filteredCourts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Không tìm thấy sân phù hợp với bộ lọc.
              </div>
            ) : (
              filteredCourts.map((court) => (
              <Card
                key={court.id}
                className="group overflow-hidden border-border/60 bg-card/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                    <div>
                      <CardTitle className="text-xl">{court.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {court.location}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                      <Star className="h-4 w-4 fill-current" />
                      {court.rating}
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
                      <p className="text-xl font-semibold text-primary">
                        {court.price}
                      </p>
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
              </Card>
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

        {/* Pricing Section */}
        <section
          id="pricing"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        >
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">Bảng giá</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Linh hoạt theo khung giờ và nhu cầu
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {pricePlans.map((plan) => (
              <Card key={plan.title} className="border-border/60 bg-card/80">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{plan.title}</h3>
                  </div>
                  <div className="text-3xl font-semibold text-primary">
                    {plan.price}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {plan.note}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-[2rem] border border-border/60 bg-gradient-to-r from-primary/10 via-background to-emerald-500/10 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
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
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-4">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Phù hợp nhóm bạn</p>
                    <p className="text-sm text-muted-foreground">
                      Đặt lẻ hoặc đặt theo nhóm đều nhanh gọn.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-4">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
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
              <div className="rounded-2xl border border-border/60 bg-card/80 p-5">
                <p className="text-sm text-muted-foreground">
                  Tính năng nổi bật
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
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

              <div className="rounded-2xl border border-border/60 bg-card/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
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
          <div className="rounded-[2rem] border border-border/60 bg-card/90 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-medium text-primary">Liên hệ</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Sẵn sàng đặt sân cho buổi chơi tiếp theo?
                </h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Đội ngũ Sports Center luôn sẵn sàng hỗ trợ chọn sân, kiểm tra
                  lịch trống và tư vấn dịch vụ phù hợp cho nhóm của bạn.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <a href="#booking">Xem sân trống</a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="tel:02812345678">Gọi tư vấn</a>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                  <p className="text-sm text-muted-foreground">Hotline</p>
                  <p className="mt-2 text-lg font-semibold">(028) 1234 5678</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="mt-2 text-lg font-semibold">
                    contact@sportscenter.vn
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="mt-2 text-lg font-semibold">
                    123 Đường ABC, Quận 1, TP.HCM
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                  <p className="text-sm text-muted-foreground">Hỗ trợ</p>
                  <p className="mt-2 text-lg font-semibold">24/7 Online</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Sports Center</p>
                  <p className="text-sm text-muted-foreground">
                    Sports Center Booking System
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
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="outline" onClick={onLoginClick}>
                  Đăng nhập
                </Button>
                <Button onClick={onRegisterClick}>Đăng ký</Button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border/60 pt-6 text-sm text-muted-foreground">
            © 2026 Sports Center. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
