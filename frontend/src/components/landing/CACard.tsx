"use client";

import Link from "next/link";
import { Star, MapPin, Clock, Languages, CheckCircle, Calendar, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface CACardProps {
  ca: {
    id: string;
    firstName: string;
    lastName: string;
    bio?: string;
    experienceYears: number;
    avatarUrl?: string;
    city?: string;
    state?: string;
    languages?: string;
    averageRating: number;
    totalReviews: number;
    isAvailable: boolean;
    specializations?: Array<{ service: { name: string; slug: string } }>;
    _real?: boolean;
  };
  index?: number;
}

const gradients = [
  "from-violet-600 to-indigo-600",
  "from-blue-600 to-cyan-500",
  "from-emerald-600 to-teal-500",
  "from-rose-600 to-pink-500",
  "from-amber-600 to-orange-500",
  "from-purple-600 to-violet-500",
];

export function CACard({ ca, index = 0 }: CACardProps) {
  const name = `${ca.firstName} ${ca.lastName}`;
  const langList = ca.languages?.split(",").map((l) => l.trim()).slice(0, 2) || ["English"];
  const gradient = gradients[index % gradients.length];
  const specs = ca.specializations?.slice(0, 2) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300 overflow-hidden"
    >
      {/* Coloured top strip */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      {/* Gradient wash on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none`} />

      <div className="p-5 relative">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative shrink-0">
            <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-gray-100 group-hover:ring-4 transition-all">
              <AvatarImage src={ca.avatarUrl} alt={name} />
              <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-base font-bold`}>
                {getInitials(ca.firstName, ca.lastName)}
              </AvatarFallback>
            </Avatar>
            {ca.isAvailable && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-bold text-gray-900 text-base truncate">{name}</h3>
              <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />
            </div>
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-gray-800">{ca.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({ca.totalReviews})</span>
            </div>
            {ca.city && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                {ca.city}{ca.state && `, ${ca.state}`}
              </div>
            )}
          </div>

          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            ca.isAvailable
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}>
            {ca.isAvailable ? "Available" : "Busy"}
          </span>
        </div>

        {/* Specializations */}
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {specs.map(({ service }) => (
              <span key={service.slug} className={`text-[10px] font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent border border-gray-100 rounded-full px-2.5 py-0.5`}>
                {service.name}
              </span>
            ))}
            {(ca.specializations?.length || 0) > 2 && (
              <span className="text-[10px] font-medium text-gray-400 border border-gray-100 rounded-full px-2.5 py-0.5">
                +{(ca.specializations?.length || 0) - 2}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {ca.bio && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">{ca.bio}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 flex-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{ca.experienceYears}+ yrs</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 flex-1 min-w-0">
            <Languages className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{langList.join(", ")}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          {ca._real ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live on Platform
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Briefcase className="w-3 h-3" /> Demo Profile
            </span>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Button
              size="sm"
              className={`rounded-xl text-xs font-semibold h-8 px-3 ${
                ca._real
                  ? `bg-gradient-to-r ${gradient} hover:opacity-90 border-0 shadow-md`
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-default"
              }`}
              asChild
            >
              <Link href={ca._real ? `/ca/${ca.id}` : "/services"}>
                <Calendar className="mr-1 h-3.5 w-3.5" />
                {ca._real ? "Book Now" : "Explore"}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
