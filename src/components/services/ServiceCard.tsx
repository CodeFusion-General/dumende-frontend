import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  link: string;
  onClick?: () => void;
}

const ServiceCard = ({
  title,
  description,
  Icon,
  color,
  link,
  onClick,
}: ServiceCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(link);
    }
  };

  return (
    <GlassCard
      className="p-6 h-full flex flex-col cursor-pointer animate-hover-lift group"
      onClick={handleClick}
    >
      {/* Floating animated icon */}
      <div className="relative mb-6">
        <div
          className={cn(
            "glass-light p-4 rounded-2xl w-fit backdrop-blur-sm border border-white/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 animate-float",
            "group-hover:shadow-lg group-hover:shadow-blue-400/20"
          )}
        >
          <Icon
            size={28}
            className="text-white transition-all duration-300 group-hover:text-gradient animate-wiggle"
          />
        </div>

        {/* Glow effect behind icon */}
        <div className="absolute inset-0 glass-light rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-sm scale-110" />
      </div>

      {/* Title with gradient text effect */}
      <h3 className="text-xl font-bold mb-4 text-white group-hover:text-gradient transition-all duration-300 animate-fade-in-up">
        {title}
      </h3>

      {/* Description */}
      <p className="text-white/80 mb-6 flex-grow leading-relaxed animate-fade-in-up">
        {description}
      </p>

      {/* Glass button */}
      <Button className="glass-button bg-white/20 hover:bg-gradient-sunset hover:text-gray-800 text-white border border-white/30 transition-all duration-300 animate-ripple group-hover:transform group-hover:scale-105">
        Detaylı Bilgi
      </Button>

      {/* Floating particles effect */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div
        className="absolute top-8 right-8 w-1 h-1 bg-white/20 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="absolute top-12 right-6 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-600"
        style={{ animationDelay: "0.4s" }}
      />
    </GlassCard>
  );
};

export default ServiceCard;
