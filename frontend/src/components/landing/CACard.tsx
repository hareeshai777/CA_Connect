"use client";

import Link from "next/link";
import { Star, MapPin, Clock, Languages, CheckCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    _real?: boolean; // true = real DB CA, false/undefined = demo placeholder
  };
  index?: number;
}

export function CACard({ ca, index = 0 }: CACardProps) {
  const name = `${ca.firstName} ${ca.lastName}`;
  const langList = ca.languages?.split(",").map((l) => l.trim()).slice(0, 3) || ["English"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Top Accent — green for real enrolled CA, brand for demo */}
      <div className={`h-1 bg-gradient-to-r ${ca._real ? "from-green-500 to-emerald-600" : "from-brand-500 to-brand-700"}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-brand-100">
              <AvatarImage src={ca.avatarUrl} alt={name} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-lg font-bold">
                {getInitials(ca.firstName, ca.lastName)}
              </AvatarFallback>
            </Avatar>
            {ca.isAvailable && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold font-heading text-lg text-gray-900 truncate">{name}</h3>
              <CheckCircle className="w-4 h-4 text-brand-600 shrink-0" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-800">{ca.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({ca.totalReviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              {ca.city}{ca.state && `, ${ca.state}`}
            </div>
          </div>
          <Badge variant={ca.isAvailable ? "success" : "secondary"} className="shrink-0 text-xs">
            {ca.isAvailable ? "Available" : "Busy"}
          </Badge>
        </div>

        {/* Specializations */}
        {ca.specializations && ca.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ca.specializations.slice(0, 3).map(({ service }) => (
              <Badge key={service.slug} variant="info" className="text-xs">
                {service.name}
              </Badge>
            ))}
            {ca.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                +{ca.specializations.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Bio */}
        {ca.bio && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{ca.bio}</p>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-2">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>{ca.experienceYears}+ yrs exp</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-2">
            <Languages className="w-3.5 h-3.5 text-brand-500" />
            <span className="truncate">{langList.join(", ")}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {ca._real && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              Live on Platform
            </span>
          )}
          {!ca._real && <span />}
          <Button className={`rounded-xl text-sm ${ca._real ? "bg-brand-600 hover:bg-brand-700" : "bg-gray-400 hover:bg-gray-500 cursor-default"}`} asChild>
            <Link href={ca._real ? `/ca/${ca.id}` : "/services"}>
              <Calendar className="mr-1.5 h-4 w-4" />
              {ca._real ? "Book Now" : "Explore"}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
