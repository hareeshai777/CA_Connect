import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -right-32 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-gold-400/10 rounded-full" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white font-heading">CA<span className="text-gold-400">Connect</span></span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold font-heading text-white mb-4 leading-tight">
            India's Most Trusted<br />CA Platform
          </h1>
          <p className="text-brand-200 text-lg mb-10">
            Connect with verified Chartered Accountants for all your financial and compliance needs.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Verified CAs" },
              { value: "10,000+", label: "Happy Clients" },
              { value: "₹50Cr+", label: "Tax Saved" },
              { value: "4.9★", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-brand-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-brand-300 text-sm">
          © {new Date().getFullYear()} CAConnect Platform. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading">CA<span className="text-brand-600">Connect</span></span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
