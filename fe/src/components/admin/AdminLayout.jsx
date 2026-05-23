import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Dumbbell,
  Map,
  CalendarDays,
  Menu,
  X,
  MessageCircle,
  Star,
  CalendarRange,
  QrCode,
  Home,
  Bell,
  BellOff,
  Check,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { WS_URL } from "@/config/api";
import { chatService } from "@/services/chatService";
import { notificationService } from "@/services/notificationService";
import { showToast } from "@/utils/toast";

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.15); // G5
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
    osc2.frequency.exponentialRampToValueAtTime(987.77, audioCtx.currentTime + 0.25); // B5
    
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.35);
    osc2.start(audioCtx.currentTime + 0.08);
    osc2.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.warn("Web Audio API chime failed to play", e);
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return "";
  }
};

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [totalNotifPages, setTotalNotifPages] = useState(1);

  const fetchNotifications = async (page = 1) => {
    try {
      const notifsRes = await notificationService.getNotifications(page, 5);
      if (notifsRes && notifsRes.data) {
        const normalized = (notifsRes.data.data || []).map(n => ({
          ...n,
          isRead: n.isRead !== undefined ? n.isRead : n.read
        }));
        setNotifications(normalized);
        setNotifPage(notifsRes.data.currentPage || 1);
        setTotalNotifPages(notifsRes.data.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  // Fetch initial notifications
  useEffect(() => {
    if (!user || !user.roles?.includes("ADMIN")) return;

    const fetchInitialData = async () => {
      await fetchNotifications(1);
      try {
        const unreadRes = await notificationService.getUnreadCount();
        if (unreadRes && unreadRes.data !== undefined) {
          setUnreadCount(unreadRes.data);
        }
      } catch (e) {
        console.error("Failed to load unread count", e);
      }
    };

    fetchInitialData();
  }, [user]);

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > totalNotifPages) return;
    await fetchNotifications(newPage);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
    }
  };

  const handleDelete = async (id) => {
    try {
      const notif = notifications.find(n => n.id === id);
      await notificationService.deleteNotification(id);
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      await fetchNotifications(notifPage);
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  useEffect(() => {
    if (!user || !user.roles?.includes("ADMIN")) return;

    const socket = new SockJS(`${WS_URL}`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to booking live notifications
        client.subscribe("/topic/admin/notifications", (msg) => {
          try {
            const newNotif = JSON.parse(msg.body);
            const normalizedNotif = {
              ...newNotif,
              isRead: newNotif.isRead !== undefined ? newNotif.isRead : newNotif.read
            };
            setNotifications((prev) => {
              if (prev.find((n) => n.id === normalizedNotif.id)) return prev;
              const updated = [normalizedNotif, ...prev];
              return updated.slice(0, 5);
            });
            setUnreadCount((prev) => prev + 1);
            playNotificationSound();
            showToast.info(
              <div className="flex flex-col gap-1">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {newNotif.title}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {newNotif.message}
                </span>
              </div>
            );
            // Sync with backend metadata in the background
            fetchNotifications(notifPage);
          } catch (err) {
            console.error("Error handling incoming live notification", err);
          }
        });

        client.subscribe("/topic/chat/admin", (msg) => {
          const newMsg = JSON.parse(msg.body);
          // Get the currently active chat from query cache (set by ChatPage)
          const currentSelectedId = queryClient.getQueryData(["activeChatId"]);

          // Update messages cache if viewing the active conversation
          if (currentSelectedId === newMsg.conversationId) {
            queryClient.setQueryData(
              ["chat", "messages", newMsg.conversationId],
              (old) => {
                const prev = old || [];
                if (prev.find((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              },
            );
            chatService
              .markAsRead(newMsg.conversationId, "ADMIN")
              .catch(console.error);
          }

          // Update conversations list (page 0)
          queryClient.setQueryData(["chat", "conversations", 0], (oldData) => {
            if (!oldData) return oldData;

            const prev = oldData.content || [];
            const index = prev.findIndex((c) => c.id === newMsg.conversationId);
            let updatedList = [...prev];

            const isUnread =
              currentSelectedId !== newMsg.conversationId &&
              newMsg.senderType !== "ADMIN" &&
              newMsg.senderType !== "BOT";

            if (index !== -1) {
              const prevUnreadCount = updatedList[index].unreadCount || 0;
              const updatedConv = {
                ...updatedList[index],
                lastMessage: newMsg.content,
                lastMessageAt: newMsg.createdAt,
                unreadCount: isUnread ? prevUnreadCount + 1 : prevUnreadCount,
              };
              updatedList.splice(index, 1);
              updatedList.unshift(updatedConv);
            } else {
              const tempConv = {
                id: newMsg.conversationId,
                guestName:
                  newMsg.senderType === "GUEST" ? newMsg.senderName : null,
                userFullName:
                  newMsg.senderType === "USER" ? newMsg.senderName : null,
                guestPhone: newMsg.senderType === "GUEST" ? "Khách mới" : null,
                lastMessage: newMsg.content,
                lastMessageAt: newMsg.createdAt,
                unreadCount: isUnread ? 1 : 0,
              };
              updatedList.unshift(tempConv);
              setTimeout(() => {
                queryClient.invalidateQueries({
                  queryKey: ["chat", "conversations", 0],
                });
              }, 1000);
            }
            return { ...oldData, content: updatedList };
          });
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [queryClient, user]);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    {
      name: "Bảng Điều Khiển",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    { name: "Người Dùng", path: "/admin/users", icon: Users },
    { name: "Loại Sân", path: "/admin/sport-types", icon: Dumbbell },
    { name: "Sân Bãi", path: "/admin/courts", icon: Map },
    { name: "Đặt Sân", path: "/admin/bookings", icon: CalendarDays },
    { name: "Đánh Giá", path: "/admin/reviews", icon: Star },
    { name: "Tin Nhắn", path: "/admin/chat", icon: MessageCircle },
    { name: "Sự Kiện", path: "/admin/events", icon: CalendarRange },
    { name: "Quét QR", path: "/admin/scanner", icon: QrCode },
    { name: "Trang Khách Hàng", path: "/", icon: Home },
  ];

  return (
    <div className="h-screen admin-liquid-bg text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 liquid-glass-sidebar hidden md:flex flex-col z-10 relative">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link
            to="/admin"
            className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent"
          >
            Bảng Quản Trị
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg liquid-nav-item ${
                  isActive
                    ? "liquid-nav-active"
                    : "text-muted-foreground"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 liquid-glass-sidebar transform transition-transform duration-200 ease-in-out md:hidden flex flex-col ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link
            to="/admin"
            className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent"
            onClick={() => setMobileMenuOpen(false)}
          >
            Bảng Quản Trị
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-muted-foreground"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg liquid-nav-item ${
                  isActive
                    ? "liquid-nav-active"
                    : "text-muted-foreground"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative z-0">
        {/* Header */}
        <header className="h-16 liquid-glass-header flex items-center justify-between px-4 sm:px-6 relative z-10">
          <div className="flex items-center md:hidden gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-foreground"
            >
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold">Bảng Quản Trị</span>
          </div>
          <div className="hidden md:flex flex-1"></div>
          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 text-foreground hover:bg-foreground/10 rounded-full transition-all focus:outline-none flex items-center justify-center active:scale-95"
              >
                <Bell size={20} className={unreadCount > 0 ? "animate-swing" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-lg scale-90">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowNotificationsDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl z-40 overflow-hidden transform origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                    {/* Header */}
                    <div className="p-4 border-b border-border/40 flex items-center justify-between bg-foreground/5">
                      <h3 className="font-semibold text-sm">Thông Báo Đặt Sân</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                        >
                          Đọc tất cả
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-border/20">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                          <BellOff size={32} className="opacity-40" />
                          <span>Chưa có thông báo nào</span>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 flex gap-3 transition-all relative group border-b border-border/10 ${
                              !notif.isRead 
                                ? "bg-teal-500/8 dark:bg-teal-500/12 hover:bg-teal-500/12 dark:hover:bg-teal-500/18 border-l-4 border-teal-500" 
                                : "bg-transparent hover:bg-foreground/5 border-l-4 border-transparent"
                            }`}
                          >
                            {/* Icon Indicator */}
                            <div className="mt-0.5 flex-shrink-0">
                              {notif.type === "BOOKING_CREATED" ? (
                                <div className={`p-1.5 rounded-lg transition-colors ${
                                  !notif.isRead 
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  <CalendarDays size={16} />
                                </div>
                              ) : (
                                <div className={`p-1.5 rounded-lg transition-colors ${
                                  !notif.isRead 
                                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" 
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  <X size={16} />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-4 z-20">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className={`text-xs ${!notif.isRead ? "font-bold text-foreground" : "font-semibold text-foreground/80"}`}>
                                  {notif.title}
                                </p>
                                {!notif.isRead ? (
                                  <span className="px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-600 dark:text-teal-400 text-[9px] font-bold tracking-wide uppercase flex items-center gap-1 border border-teal-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse flex-shrink-0" />
                                    Mới
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-foreground/10 text-muted-foreground text-[9px] font-semibold border border-border/40">
                                    Đã đọc
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs line-clamp-2 mt-1 ${!notif.isRead ? "text-foreground/90 font-medium" : "text-muted-foreground font-normal"}`}>
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-muted-foreground font-medium mt-2 block">
                                {formatRelativeTime(notif.createdAt)}
                              </span>
                            </div>

                            {/* Actions overlay */}
                            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notif.id);
                                  }}
                                  title="Đánh dấu đã đọc"
                                  className="p-1 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-foreground/5 rounded"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notif.id);
                                }}
                                title="Xóa"
                                className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-foreground/5 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Click Area Overlay for navigation */}
                            <div 
                              className="absolute inset-0 z-10 cursor-pointer"
                              onClick={(e) => {
                                  if (e.target.closest('button')) return;
                                  setShowNotificationsDropdown(false);
                                  if (!notif.isRead) {
                                    handleMarkAsRead(notif.id);
                                  }
                                  window.location.href = `/admin/bookings?keyword=${notif.targetId || ""}`;
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Controls */}
                    {totalNotifPages > 1 && (
                      <div className="p-3 border-t border-border/20 flex items-center justify-between bg-foreground/5 text-xs text-muted-foreground">
                        <button
                          disabled={notifPage === 1}
                          onClick={() => handlePageChange(notifPage - 1)}
                          className="px-2.5 py-1 text-[11px] rounded-lg border border-border/40 hover:bg-foreground/5 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition-colors cursor-pointer select-none active:scale-95 disabled:pointer-events-none"
                        >
                          Trước
                        </button>
                        <span className="font-semibold select-none">
                          Trang {notifPage} / {totalNotifPages}
                        </span>
                        <button
                          disabled={notifPage === totalNotifPages}
                          onClick={() => handlePageChange(notifPage + 1)}
                          className="px-2.5 py-1 text-[11px] rounded-lg border border-border/40 hover:bg-foreground/5 disabled:opacity-40 disabled:hover:bg-transparent font-medium transition-colors cursor-pointer select-none active:scale-95 disabled:pointer-events-none"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <ThemeToggle />
            <span className="text-sm font-medium text-foreground drop-shadow-sm">
              Xin chào, {user?.fullName || "Admin"}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-cyan-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold avatar-glow backdrop-blur-md">
              {user?.fullName?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
