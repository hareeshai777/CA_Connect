"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, FileText, MessageSquare,
  Bell, LogOut, Menu, ChevronRight, Briefcase,
  Settings, FolderOpen,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { api } from "@/lib/api";

const navItems = [
  { label: "Dashboard",   href: "/assistance/dashboard",     icon: LayoutDashboard },
  { label: "Cases",       href: "/assistance/cases",         icon: FolderOpen },
  { label: "Tasks",       href: "/assistance/tasks",         icon: CheckSquare },
  { label: "Documents",   href: "/assistance/documents",     icon: FileText },
  { label: "Team Chat",   href: "/assistance/communication", icon: MessageSquare },
  { label: "Settings",    href: "/assistance/settings",      icon: Settings },
];

export default function AssistanceLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, accessToken, isAuthenticated, logout, fetchMe, hasHydrated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) { router.push("/auth/login"); return; }
    if (!user || !isAuthenticated) { fetchMe(); return; }
    if (user.role !== "ASSISTANCE_TEAM" && user.role !== "SUPER_ADMIN") {
      if (user.role === "CA_PROFESSIONAL") router.push("/ca/dashboard");
      else router.push("/client/dashboard");
    }
  }, [hasHydrated, accessToken, isAuthenticated, user, router]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    router.push("/");
  };

  const profile = (user as any)?.assistanceMember;
  const initials = getInitials(profile?.firstName || user?.email?.[0] || "A", profile?.lastName);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn(
      "flex flex-col bg-white border-r border-border",
      mobile ? "w-72 h-full" : "w-64 min-h-screen sticky top-0"
    )}>
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm font-heading">CA<span className="text-emerald-600">Connect</span></span>
            <p className="text-[10px] text-muted-foreground leading-none">Assistance Team</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active ? "bg-emerald-50 text-emerald-700" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
              <Icon className={cn("w-4 h-4", active ? "text-emerald-600" : "group-hover:text-foreground")} />
              {label}
              {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-emerald-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{profile?.firstName || "Team Member"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{profile?.designation || "Assistance Team"}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-4 h-4" />
          </Button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate capitalize">
              {pathname.split("/").filter(Boolean).join(" › ")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl" title="Notifications">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
