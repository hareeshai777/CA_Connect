"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FileText, CreditCard, User, MessageCircle, LogOut, Bell, Download, HelpCircle, Loader2 } from "lucide-react";
import { CALogo } from "@/components/ui/CALogo";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

const navItems = [
  { href: "/client/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/client/bookings", icon: Calendar, label: "My Bookings" },
  { href: "/client/documents", icon: FileText, label: "Documents" },
  { href: "/client/payments", icon: CreditCard, label: "Payments" },
  { href: "/client/downloads", icon: Download, label: "Downloads" },
  { href: "/client/support", icon: HelpCircle, label: "Support" },
  { href: "/client/profile", icon: User, label: "Profile" },
  { href: "/client/ai-chat", icon: MessageCircle, label: "AI Assistant" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isAuthenticated, logout, fetchMe, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications?limit=10");
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.meta?.unread || 0);
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (!hasHydrated) return; // wait for localStorage to be read
    if (!accessToken) { router.push("/auth/login"); return; }
    if (!user || !isAuthenticated) { fetchMe(); return; }
    if (user.role === "CA_PROFESSIONAL") { router.push("/ca/dashboard"); return; }
    if (user.role === "SUPER_ADMIN") { router.push("/admin/dashboard"); return; }
    if (user.role === "ASSISTANCE_TEAM") { router.push("/assistance/dashboard"); return; }
  }, [hasHydrated, accessToken, isAuthenticated, user]);

  // Fetch notifications on mount and every 30s
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    router.push("/");
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const profile = user?.clientProfile;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border fixed inset-y-0 left-0 z-40 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <CALogo size={40} />
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-xl bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                {getInitials(profile?.firstName || "U", profile?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.firstName} {profile?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="text-lg font-semibold font-heading">
            {navItems.find((n) => n.href === pathname)?.label || "Dashboard"}
          </div>
          <div className="flex items-center gap-3 relative">
            <button onClick={() => { setShowNotif(!showNotif); if (!showNotif && unreadCount > 0) markAllRead(); }}
              className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotif && (
              <div className="absolute top-10 right-0 w-80 bg-white border border-border rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <p className="font-semibold text-sm">Notifications</p>
                  {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline">Mark all read</button>}
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b last:border-0 hover:bg-muted/30 cursor-default ${!n.isRead ? "bg-blue-50/50" : ""}`}>
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{n.body}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Click-away overlay */}
            {showNotif && <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />}
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                {getInitials(profile?.firstName || "U", profile?.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
