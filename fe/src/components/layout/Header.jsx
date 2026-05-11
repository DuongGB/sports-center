import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Dumbbell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Trang chủ", href: "#home" },
  { label: "Đặt sân", href: "#booking" },
  { label: "Sân thể thao", href: "#sports" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "Liên hệ", href: "#contact" },
];

export default function Header({
  user,
  isAuthenticated,
  onLoginClick,
  onRegisterClick,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    onLogout?.();
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate(`/${href}`);
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold">Sports Center</div>
            <div className="text-xs text-muted-foreground">
              Sports Center Booking System
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="hidden items-center gap-3 rounded-full border border-border bg-card px-3 py-2 sm:flex">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                    user?.id || "sports-center"
                  }`}
                  alt={user?.fullName || "User"}
                />
                <AvatarFallback>
                  {(user?.fullName || "U").slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[160px] truncate text-sm font-medium">
                  {user?.fullName || "Tài khoản của bạn"}
                </p>
                <p className="max-w-[160px] truncate text-xs text-muted-foreground">
                  {user?.phone || "Đã đăng nhập"}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link to="/profile">
                  <Button variant="ghost" size="sm">Trang cá nhân</Button>
                </Link>
                <Link to="/my-bookings">
                  <Button variant="ghost" size="sm">Lịch sử đặt sân</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" onClick={onLoginClick}>
                Đăng nhập
              </Button>
              <Button onClick={onRegisterClick}>Đăng ký</Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                        user?.id || "sports-center"
                      }`}
                      alt={user?.fullName || "User"}
                    />
                    <AvatarFallback>
                      {(user?.fullName || "U").slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.phone}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2 px-2">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Trang cá nhân</Button>
                  </Link>
                  <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Lịch sử đặt sân</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick?.();
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onRegisterClick?.();
                  }}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
