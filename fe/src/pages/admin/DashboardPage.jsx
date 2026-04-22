import { Users, Activity, CreditCard, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      name: "Tổng doanh thu",
      value: "$45,231.89",
      icon: DollarSign,
      change: "+20.1% so với tháng trước",
    },
    {
      name: "Người dùng",
      value: "+2350",
      icon: Users,
      change: "+180.1% so với tháng trước",
    },
    {
      name: "Lượt đặt sân",
      value: "+12,234",
      icon: Activity,
      change: "+19% so với tháng trước",
    },
    {
      name: "Đang hoạt động",
      value: "+573",
      icon: Activity,
      change: "+201 trong giờ qua",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="p-6 bg-card rounded-xl border border-border shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
                  {stat.name}
                </h3>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="min-h-[400px] rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-2">Các phần bổ sung của bảng điều khiển sẽ được hiển thị ở đây</p>
        <p className="text-sm text-muted-foreground/70">VD: Biểu đồ, Lượt đặt gần đây, v.v.</p>
      </div>
    </div>
  );
}
