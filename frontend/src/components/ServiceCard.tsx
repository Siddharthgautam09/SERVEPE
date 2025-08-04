import React from "react";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Service } from "@/types/service";
import { formatCurrency } from "@/utils/currency";

interface ServiceCardProps {
  service: Service;
  onClick: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const handleClick = () => {
    onClick(service._id);
  };

  return (
    <Card
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer max-w-[320px] mx-auto"
      onClick={handleClick}
    >
      {/* Service Image Section */}
      <div className="relative w-full aspect-[5/3] overflow-hidden rounded-2xl bg-gray-200">
        {service.images && service.images.length > 0 ? (
          <img
            src={service.images.find((img) => img.isPrimary)?.url || service.images[0]?.url}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-sm">Video Editing</div>
            </div>
          </div>
        )}
        {/* Heart Icon */}
        <button
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          onClick={(e) => e.stopPropagation()}
          aria-label="Favorite"
        >
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
        {/* Blue Overlay */}
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none rounded-tr-2xl rounded-br-2xl"></div>
      </div>

      {/* Service Details Section */}
      <div className="p-5">
        {/* Freelancer Profile */}
        <div className="flex items-center mb-3">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
            {service.freelancer.profilePicture ? (
              <img
                src={service.freelancer.profilePicture}
                alt={`${service.freelancer.firstName} ${service.freelancer.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base select-none">
                {service.freelancer.firstName?.[0]}{service.freelancer.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="ml-3 flex items-center">
            <span className="text-sm font-semibold text-gray-800">
              {service.freelancer.firstName} {service.freelancer.lastName}
            </span>
            <img 
              src="/src/images/verified.png" 
              alt="Verified"
              className="ml-2 w-4 h-4"
            />
          </div>
        </div>

        {/* Service Title */}
        <h3 className="text-lg font-bold text-[#3E3E3E] mb-3 line-clamp-2">{service.title}</h3>

        {/* Rating and Orders */}
        <div className="flex items-center gap-1 mb-2 text-sm text-gray-700">
          <Star className="w-4 h-4 text-[#3E3E3E]" fill="currentColor" />
          <span className="font-semibold">{service.averageRating?.toFixed(1) || "4.8"}</span>
          <span className="text-gray-500 ml-1">({service.totalReviews || 269} Orders)</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="line-through text-gray-400 text-sm">{formatCurrency(service.pricingPlans?.basic?.price * 2 || 2300)}</span>
          <span className="text-xl font-bold text-[#3E3E3E]">{formatCurrency(service.pricingPlans?.basic?.price || 1100)}</span>
          <Badge className="bg-transparent text-[#008A48] text-xs px-2 py-0.5 rounded-full border-0">
            65% OFF
          </Badge>
        </div>

        {/* Delivery Time */}
        <div className="text-[#3A3A3A] text-sm">Delivery in {service.pricingPlans?.basic?.deliveryTime || 3} Days</div>
      </div>
    </Card>
  );
};

export default ServiceCard;
