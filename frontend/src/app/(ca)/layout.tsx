"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Briefcase, LayoutDashboard, Calendar, Users, User, LogOut, Bell, FileText, TrendingUp, Clock, Settings, CheckSquare, FolderOpen } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";

const navItems = [
  { href: "/ca/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/ca/cases", icon: FolderOpen, label: "Cases" },
  { href: "/ca/bookings", icon: Calendar, label: "Bookings" },
  { href: "/ca/schedule", icon: Clock, label: "My Schedule" },
  { href: "/ca/clients", icon: Users, label: "Clients" },
  { href: "/ca/earnings", icon: TrendingUp, label: "Earnings" },
  { href: "/ca/tasks", icon: CheckSquare, label: "Task Dashboard" },
  { href: "/ca/documents", icon: FileText, label: "Documents" },
  { href: "/ca/profile", icon: User, label: "Profile" },
  { href: "/ca/settings", icon: Settings, label: "Settings" },
];

export default function CALayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isAuthenticated, logout, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!accessToken) { router.push("/auth/login"); return; }
    if (!user || !isAuthenticated) { fetchMe(); return; }
    if (user.role !== "CA_PROFESSIONAL") { router.push("/auth/login"); return; }
  }, [accessToken, isAuthenticated, user]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    router.push("/");
  };

  const ca = user?.caProfessional;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border fixed inset-y-0 left-0 z-40 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-heading">CA<span className="text-brand-600">Connect</span></span>
          </Link>
          <div className="mt-3">
            <Badge variant={ca?.status === "ACTIVE" ? "success" : "warning"} className="text-xs">
              {ca?.status || "PENDING"}
            </Badge>
          </div>
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
              <AvatarImage src={ca?.avatarUrl} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                {getInitials(ca?.firstName || "C", ca?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ca?.firstName} {ca?.lastName}</p>
              <p className="text-xs text-muted-foreground">CA Professional</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4" />Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64">
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="text-lg font-semibold font-heading">
            {navItems.find((n) => n.href === pathname)?.label || "Dashboard"}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full" />
            </button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={ca?.avatarUrl} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                {getInitials(ca?.firstName || "C", ca?.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
