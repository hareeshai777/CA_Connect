"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ChevronDown, User, LogOut,
  LayoutDashboard, Bell, Settings,
} from "lucide-react";
import { CALogo } from "@/components/ui/CALogo";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    router.push("/");
  };

  const getDashboardLink = () => {
    if (user?.role === "CA_PROFESSIONAL") return "/ca/dashboard";
    if (user?.role === "SUPER_ADMIN") return "/admin/dashboard";
    return "/client/dashboard";
  };

  const profile = user?.clientProfile || user?.caProfessional;
  const isHomePage = pathname === "/";
  const useLight = isHomePage && !scrolled && !isOpen;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      useLight ? "bg-transparent" : "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <CALogo size={44} />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  useLight
                    ? pathname === link.href
                      ? "bg-white/20 text-white"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                    : pathname === link.href
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn("flex items-center gap-2 rounded-xl h-10 px-3", useLight && "text-white hover:text-white hover:bg-white/15")}>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={profile?.avatarUrl} />
                      <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
                        {getInitials(profile?.firstName || user.email[0], profile?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {profile?.firstName || user.email.split("@")[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{profile?.firstName} {profile?.lastName}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/client/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      <Badge className="ml-auto" variant="destructive">3</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className={cn("rounded-xl", useLight ? "text-white hover:text-white hover:bg-white/15" : "text-gray-700 hover:text-gray-900")} asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button className={cn("rounded-xl font-semibold", useLight ? "bg-white text-brand-700 hover:bg-white/90" : "bg-brand-600 text-white hover:bg-brand-700")} asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <Button variant="ghost" size="icon" className={cn("md:hidden rounded-xl", useLight && "text-white hover:text-white hover:bg-white/15")} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-white"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => { router.push(getDashboardLink()); setIsOpen(false); }}>
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full rounded-xl text-destructive" onClick={handleLogout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full rounded-xl" asChild>
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>Sign in</Link>
                    </Button>
                    <Button className="w-full rounded-xl bg-brand-600 hover:bg-brand-700" asChild>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
