import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Trophy,
  MapPin,
  Clock3,
  BarChart3,
  Loader2,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useRevenueOverview,
  useMonthlyRevenue,
  useWeeklyRevenue,
  useBookingsByStatus,
  useRevenueBySportType,
  useTopCourts,
  useRecentBookings,
} from "@/hooks/queries/useRevenueQueries";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatDate } from "@/utils/dateUtils";

// ===== Helpers =====
const formatCurrency = (val) => {
  if (val == null) return "0đ";
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return `${val.toLocaleString("vi-VN")}đ`;
};

const formatFullCurrency = (val) => {
  if (val == null) return "0đ";
  return val.toLocaleString("vi-VN") + "đ";
};

const formatTime = (t) => (t ? t.substring(0, 5) : "??:??");

const STATUS_COLORS = {
  PENDING: "#f59e0b",
  CONFIRMED: "#10b981",
  CANCELLED: "#ef4444",
  COMPLETED: "#3b82f6",
};

const STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
};

const SPORT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

const PIE_COLORS = ["#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

// ===== Custom Tooltip =====
const CustomTooltip = ({ active, payload, label, suffix = "đ" }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p
          key={i}
          style={{ color: p.color }}
          className="flex items-center gap-1.5"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.name}:{" "}
          <span className="font-semibold">{formatFullCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ===== Loading Skeleton =====
function ChartSkeleton({ className = "" }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted/60" />
        <div className="h-48 rounded bg-muted/40" />
      </div>
    </div>
  );
}

// ===== Main Component =====
export default function DashboardPage() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [exportType, setExportType] = useState("year");
  const [exportValue, setExportValue] = useState(new Date().getMonth()); // Default to current month index if month type selected

  const { data: overview, isLoading: loadingOverview } = useRevenueOverview();
  const { data: monthlyData, isLoading: loadingMonthly } =
    useMonthlyRevenue(selectedYear);
  const { data: weeklyData, isLoading: loadingWeekly } = useWeeklyRevenue();
  const { data: statusData, isLoading: loadingStatus } = useBookingsByStatus();
  const { data: sportTypeData, isLoading: loadingSportType } =
    useRevenueBySportType();
  const { data: topCourts, isLoading: loadingTopCourts } = useTopCourts(5);
  const { data: recentBookings, isLoading: loadingRecent } =
    useRecentBookings();

  // ===== Export Logic =====
  const handleExportReport = () => {
    if (!monthlyData) return;

    let reportTitle = "";
    let dataRows = [];
    let totalRevenue = 0;

    const allMonths = monthlyData || [];

    if (exportType === "year") {
      reportTitle = `NĂM ${selectedYear}`;
      dataRows = allMonths.map((m, idx) => {
        const rev = m.revenue || 0;
        totalRevenue += rev;
        return [idx + 1, m.monthLabel, `${rev}`];
      });
    } else if (exportType === "month") {
      const mIdx = Number(exportValue);
      const mData = allMonths[mIdx];
      reportTitle = `${mData.monthLabel.toUpperCase()} - NĂM ${selectedYear}`;
      totalRevenue = mData.revenue || 0;
      dataRows = [[1, mData.monthLabel, `${totalRevenue}`]];
    } else if (exportType === "quarter") {
      const qIdx = Number(exportValue);
      const qMonths = [qIdx * 3, qIdx * 3 + 1, qIdx * 3 + 2];
      reportTitle = `QUÝ ${qIdx + 1} - NĂM ${selectedYear}`;

      qMonths.forEach((mIdx, i) => {
        const mData = allMonths[mIdx];
        const rev = mData ? mData.revenue || 0 : 0;
        totalRevenue += rev;
        dataRows.push([
          i + 1,
          mData ? mData.monthLabel : `Tháng ${mIdx + 1}`,
          `${rev}`,
        ]);
      });
    }

    const csvContent = [
      ["TRUNG TÂM THỂ THAO SPORTS CENTER"],
      ["Địa chỉ: Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP.HCM"],
      ["Điện thoại: 0123 456 789"],
      [],
      ["BÁO CÁO DOANH THU " + reportTitle],
      ["Ngày lập báo cáo: " + new Date().toLocaleDateString("vi-VN")],
      [],
      ["STT", "Thời gian", "Doanh thu (VNĐ)"],
      ...dataRows,
      [],
      ["TỔNG CỘNG:", "", `${totalRevenue}`],
      [],
      [],
      ["", "", "Người lập biểu"],
      ["", "", "(Ký và ghi rõ họ tên)"],
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const fileBaseName =
      exportType === "year"
        ? `Bao_cao_nam_${selectedYear}`
        : exportType === "month"
          ? `Bao_cao_thang_${Number(exportValue) + 1}_${selectedYear}`
          : `Bao_cao_quy_${Number(exportValue) + 1}_${selectedYear}`;

    link.setAttribute("download", `${fileBaseName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== Stats Cards =====
  const statCards = overview
    ? [
        {
          name: "Tổng doanh thu",
          value: formatFullCurrency(overview.totalRevenue),
          subValue: `Tháng này: ${formatFullCurrency(overview.monthRevenue)}`,
          icon: DollarSign,
          change: overview.revenueGrowthPercent,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
        },
        {
          name: "Lượt đặt sân",
          value: overview.totalBookings.toLocaleString(),
          subValue: `Tháng này: ${overview.monthBookings}`,
          icon: CalendarDays,
          change: overview.bookingGrowthPercent,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        },
        {
          name: "Người dùng",
          value: overview.totalUsers.toLocaleString(),
          subValue: `Mới tháng này: +${overview.newUsersThisMonth}`,
          icon: Users,
          change: null,
          color: "text-violet-500",
          bgColor: "bg-violet-500/10",
        },
        {
          name: "Sân hoạt động",
          value: `${overview.activeCourts}/${overview.totalCourts}`,
          subValue: "Sân đang hoạt động",
          icon: Activity,
          change: null,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Bảng điều khiển
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => queryClient.invalidateQueries()}
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Tổng quan doanh thu và thống kê hoạt động
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-2 rounded-xl border border-border/50">
          {/* Year Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-r border-border/50 last:border-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Năm:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-card border border-border/50 rounded px-2 py-0.5 text-sm font-semibold text-foreground focus:outline-none cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={y} className="bg-card text-foreground">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Export Type Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-r border-border/50 last:border-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Báo cáo:
            </span>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="bg-card border border-border/50 rounded px-2 py-0.5 text-sm font-semibold text-foreground focus:outline-none cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <option value="year" className="bg-card text-foreground">Cả năm</option>
              <option value="quarter" className="bg-card text-foreground">Theo quý</option>
              <option value="month" className="bg-card text-foreground">Theo tháng</option>
            </select>
          </div>

          {/* Value Selector (Conditional) */}
          {exportType !== "year" && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-r border-border/50 last:border-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {exportType === "month" ? "Tháng:" : "Quý:"}
              </span>
              <select
                value={exportValue}
                onChange={(e) => setExportValue(Number(e.target.value))}
                className="bg-card border border-border/50 rounded px-2 py-0.5 text-sm font-semibold text-foreground focus:outline-none cursor-pointer min-w-[80px] hover:bg-muted/50 transition-colors"
              >
                {exportType === "month"
                  ? Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={i} className="bg-card text-foreground">
                        Tháng {i + 1}
                      </option>
                    ))
                  : [1, 2, 3, 4].map((q) => (
                      <option key={q} value={q - 1} className="bg-card text-foreground">
                        Quý {q}
                      </option>
                    ))}
              </select>
            </div>
          )}

          {/* Export Button */}
          <div className="pl-2">
            <button
              onClick={() => handleExportReport()}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
            >
              <Download className="h-4 w-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      {loadingOverview ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border bg-card p-6"
            >
              <div className="h-4 w-1/2 rounded bg-muted mb-3" />
              <div className="h-6 w-2/3 rounded bg-muted mb-2" />
              <div className="h-3 w-1/3 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.change > 0;
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;
            return (
              <div
                key={stat.name}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Decorative gradient */}
                <div
                  className={`absolute top-0 right-0 h-24 w-24 rounded-bl-[4rem] ${stat.bgColor} opacity-60 transition-opacity group-hover:opacity-100`}
                />

                <div className="relative flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </h3>
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="relative">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {stat.change != null && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                          isPositive ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {isPositive ? "+" : ""}
                        {stat.change}%
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {stat.subValue}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Charts Row 1: Monthly Revenue + Weekly Revenue ===== */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Monthly Revenue Area Chart */}
        {loadingMonthly ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  Doanh thu theo tháng
                </h3>
                <p className="text-xs text-muted-foreground">
                  Biểu đồ doanh thu năm {selectedYear}
                </p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData || []}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#6366f1"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="monthLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ fill: "#6366f1", strokeWidth: 2, r: 3 }}
                  activeDot={{
                    r: 6,
                    fill: "#6366f1",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly Revenue Bar Chart */}
        {loadingWeekly ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">7 ngày gần nhất</h3>
              <p className="text-xs text-muted-foreground">
                Doanh thu theo ngày
              </p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData || []} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="dayLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Doanh thu" radius={[6, 6, 0, 0]}>
                  {(weeklyData || []).map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        idx === (weeklyData || []).length - 1
                          ? "#6366f1"
                          : "#a5b4fc"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ===== Charts Row 2: Booking Status Pie + Sport Type Revenue ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Status Pie Chart */}
        {loadingStatus ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">
                Tỉ lệ trạng thái đặt sân
              </h3>
              <p className="text-xs text-muted-foreground">
                Phân bố theo trạng thái booking
              </p>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData || []}
                    dataKey="count"
                    nameKey="statusLabel"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={3}
                    strokeWidth={0}
                    label={({ statusLabel, count, percent }) =>
                      `${statusLabel} (${count})`
                    }
                    labelLine={{
                      stroke: "hsl(var(--muted-foreground))",
                      strokeWidth: 1,
                    }}
                  >
                    {(statusData || []).map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          STATUS_COLORS[entry.status] ||
                          PIE_COLORS[idx % PIE_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} đơn`, name]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {(statusData || []).map((entry, idx) => (
                <div
                  key={entry.status}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[entry.status] ||
                        PIE_COLORS[idx % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-muted-foreground">
                    {entry.statusLabel}
                  </span>
                  <span className="font-semibold text-foreground">
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue by Sport Type */}
        {loadingSportType ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">
                Doanh thu theo loại sân
              </h3>
              <p className="text-xs text-muted-foreground">
                So sánh doanh thu giữa các môn
              </p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={sportTypeData || []}
                layout="vertical"
                barCategoryGap="18%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  opacity={0.5}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <YAxis
                  type="category"
                  dataKey="sportTypeName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Doanh thu" radius={[0, 6, 6, 0]}>
                  {(sportTypeData || []).map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={SPORT_COLORS[idx % SPORT_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ===== Row 3: Top Courts + Recent Bookings ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Courts */}
        {loadingTopCourts ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-foreground">
                  Top sân doanh thu cao nhất
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Xếp hạng theo tổng doanh thu
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground border-y border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">#</th>
                    <th className="px-6 py-3 text-left font-medium">Sân</th>
                    <th className="px-6 py-3 text-left font-medium">
                      Loại sân
                    </th>
                    <th className="px-6 py-3 text-right font-medium">
                      Lượt đặt
                    </th>
                    <th className="px-6 py-3 text-right font-medium">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(topCourts || []).length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    (topCourts || []).map((court, idx) => (
                      <tr
                        key={court.courtId}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                              idx === 0
                                ? "bg-amber-500/20 text-amber-600"
                                : idx === 1
                                  ? "bg-slate-400/20 text-slate-500"
                                  : idx === 2
                                    ? "bg-orange-400/20 text-orange-500"
                                    : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {court.courtName}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {court.location}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {court.sportTypeName}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-foreground">
                          {court.bookingCount}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatFullCurrency(court.revenue)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        {loadingRecent ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold text-foreground">
                  Đơn đặt sân gần đây
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">10 đơn mới nhất</p>
            </div>
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {(recentBookings || []).length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  Chưa có đơn đặt sân nào
                </div>
              ) : (
                (recentBookings || []).map((b) => (
                  <div
                    key={b.id}
                    className="px-6 py-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-foreground text-sm truncate">
                          {b.customerName}
                        </p>
                        <span
                          className={`shrink-0 ${
                            b.bookingStatus === "CONFIRMED"
                              ? "status-badge status-active"
                              : b.bookingStatus === "PENDING"
                                ? "status-badge status-pending"
                                : b.bookingStatus === "CANCELLED"
                                  ? "status-badge status-cancelled"
                                  : "status-badge status-completed"
                          }`}
                          style={{ fontSize: "10px", padding: "1px 8px" }}
                        >
                          {STATUS_LABELS[b.bookingStatus] || b.bookingStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {b.courtName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {formatTime(b.startTime)} - {formatTime(b.endTime)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm text-primary">
                        {formatFullCurrency(b.totalPrice)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {b.bookingDate}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
