import Link from "next/link";
import { Mail, Phone, MapPin, Twitter, Linkedin, Instagram, Facebook } from "lucide-react";
import { CALogo } from "@/components/ui/CALogo";

const footerLinks = {
  Services: [
    { label: "GST Filing", href: "/services/gst-filing" },
    { label: "Income Tax Filing", href: "/services/income-tax-filing" },
    { label: "Company Registration", href: "/services/company-registration" },
    { label: "Audit Services", href: "/services/audit-services" },
    { label: "Trademark Registration", href: "/services/trademark-registration" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Partners", href: "/partners" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
  "For CAs": [
    { label: "Become a Partner", href: "/ca/register" },
    { label: "CA Dashboard", href: "/ca/dashboard" },
    { label: "Resources", href: "/ca/resources" },
    { label: "Community", href: "/ca/community" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <CALogo size={48} />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              India's most trusted platform connecting clients with verified Chartered Accountants for seamless financial and compliance services.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@capro.in</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-brand-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold font-heading mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} CAConnect Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-gray-300 transition-colors">Cookies</Link>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Razorpay_logo.svg/320px-Razorpay_logo.svg.png" alt="Razorpay" className="h-5 opacity-50" />
          </div>
        </div>
      </div>
    </footer>
  );
}
