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
      className="bg-white border border-gray-200 rounded-[25px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Service Image Section */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {service.images && service.images.length > 0 ? (
          <img
            src={service.images.find(img => img.isPrimary)?.url || service.images[0]?.url}
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
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
        {/* Blue Overlay */}
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-blue-500/20 to-transparent"></div>
      </div>

      {/* Service Details Section */}
      <div className="p-6">
        {/* Freelancer Profile */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            {service.freelancer.profilePicture ? (
              <img
                src={service.freelancer.profilePicture}
                alt={`${service.freelancer.firstName} ${service.freelancer.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {service.freelancer.firstName?.[0]}{service.freelancer.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="ml-2 flex-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">
                {service.freelancer.firstName} {service.freelancer.lastName}
              </span>
              <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full border-0">
                Verified
              </Badge>
            </div>
          </div>
        </div>

        {/* Service Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {service.title}
        </h3>

        {/* Rating and Orders */}
        <div className="flex items-center mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
          <span className="text-sm font-medium text-gray-700">
            {service.averageRating?.toFixed(1) || "4.8"}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            ({service.totalReviews || 269} Orders)
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-center mb-3">
          <span className="text-sm text-gray-500 line-through mr-2">
            {formatCurrency(service.pricingPlans?.basic?.price * 2 || 2300)}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(service.pricingPlans?.basic?.price || 1100)}
          </span>
          <Badge className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border-0">
            65% OFF
          </Badge>
        </div>

        {/* Delivery Time */}
        <div className="text-sm text-gray-500">
          Delivery in {service.pricingPlans?.basic?.deliveryTime || 3} Days
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard; 