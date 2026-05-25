"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Briefcase, LayoutDashboard, Users, UserCheck, BarChart3, Settings, LogOut, Bell, ShieldAlert, FileText, DollarSign, PackageOpen } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/ca-management", icon: UserCheck, label: "CA Management" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/commissions", icon: DollarSign, label: "Commissions" },
  { href: "/admin/assistance-team", icon: FileText, label: "Assistance Team" },
  { href: "/admin/services", icon: PackageOpen, label: "Services" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (!user) fetchMe();
    else if (user.role !== "SUPER_ADMIN") router.push("/client/dashboard");
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 fixed inset-y-0 left-0 z-40 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-heading text-white">CA<span className="text-brand-400">Connect</span></span>
          </Link>
          <div className="mt-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs text-gold-400 font-medium">Super Admin</span>
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
                  ? "bg-brand-600/20 text-brand-400 border border-brand-600/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="px-3 py-2 rounded-xl bg-gray-800 mb-3">
            <p className="text-sm font-medium text-gray-100">Super Admin</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" />Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="text-lg font-semibold font-heading text-gray-100">
            {navItems.find((n) => pathname.startsWith(n.href))?.label || "Admin Dashboard"}
          </div>
          <button className="relative p-2 rounded-xl hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
        </header>
        <div className="p-6 bg-gray-950 min-h-[calc(100vh-65px)]">{children}</div>
      </main>
    </div>
  );
}
