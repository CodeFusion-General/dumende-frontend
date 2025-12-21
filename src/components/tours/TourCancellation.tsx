import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Check,
  Clock,
  AlertCircle,
  Shield,
  XCircle,
  Calendar
} from "lucide-react";

interface TourCancellationProps {
  policy?: string;
  className?: string;
}

// Policy configurations
interface PolicyConfig {
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: JSX.Element;
  benefits: string[];
}

const POLICY_CONFIG: Record<string, PolicyConfig> = {
  FLEXIBLE: {
    name: "Esnek",
    description: "En rahat iptal koşulları",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: <Check className="w-5 h-5 text-green-500" />,
    benefits: [
      "Turdan 24 saat öncesine kadar tam iade",
      "Ücretsiz tarih değişikliği",
      "Hızlı iade işlemi (3-5 iş günü)",
    ],
  },
  MODERATE: {
    name: "Orta",
    description: "Dengeli iptal koşulları",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: <Clock className="w-5 h-5 text-blue-500" />,
    benefits: [
      "Turdan 48 saat öncesine kadar tam iade",
      "24-48 saat arası %50 iade",
      "Tarih değişikliği mümkün",
    ],
  },
  STRICT: {
    name: "Katı",
    description: "Sınırlı iptal koşulları",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
    benefits: [
      "Turdan 7 gün öncesine kadar tam iade",
      "3-7 gün arası %50 iade",
      "Son 3 gün iade yapılmaz",
    ],
  },
  NO_REFUND: {
    name: "İade Yok",
    description: "İade yapılmaz",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    benefits: [
      "Rezervasyon sonrası iade yapılmaz",
      "Tarih değişikliği yapılabilir",
      "Devir mümkün olabilir",
    ],
  },
};

const TourCancellation: React.FC<TourCancellationProps> = ({
  policy,
  className = "",
}) => {
  // Don't render if no policy
  if (!policy || policy.trim().length === 0) {
    return null;
  }

  // Get policy config
  const policyKey = policy.toUpperCase().replace(/\s+/g, "_");
  const config = POLICY_CONFIG[policyKey];

  // If unknown policy, show generic
  if (!config) {
    return (
      <div className={className}>
        <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <RotateCcw className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700 font-montserrat">
                İptal Politikası
              </span>
              <p className="text-xs text-gray-600 font-roboto">
                {policy}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={className}>
      <GlassCard className={`${config.bgColor} backdrop-blur-sm border ${config.borderColor} p-5`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${config.bgColor} rounded-lg border ${config.borderColor}`}>
              <RotateCcw className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700 font-montserrat block">
                İptal Politikası
              </span>
              <Badge
                className={`${config.bgColor} ${config.color} border ${config.borderColor} mt-1`}
              >
                {config.icon}
                <span className="ml-1.5">{config.name}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 font-roboto mb-4">
          {config.description}
        </p>

        {/* Benefits */}
        <div className="space-y-2">
          {config.benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm"
            >
              <Check className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
              <span className="text-gray-700 font-roboto">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200/50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span className="font-roboto">
              Güvenli ödeme ve koruma altında
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TourCancellation;
