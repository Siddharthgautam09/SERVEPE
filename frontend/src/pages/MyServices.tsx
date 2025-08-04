
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, BarChart3, Sparkles, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { serviceAPI } from '@/api/services';
import placeholderImg from '@/images/profile/imgg.png';

const MyServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'pending'>('all');

  const { data: servicesData, isLoading, refetch } = useQuery({
    queryKey: ['my-services', filter],
    queryFn: () => serviceAPI.getMyServices({ status: filter === 'all' ? undefined : filter }),
  });

  const services = servicesData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        {/* <Navbar /> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 sm:h-48 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">All Services</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          {['all', 'active', 'inactive', 'paused'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status as any)}
              className={`capitalize rounded-full px-3 sm:px-6 py-2 text-sm ${filter === status ? 'bg-[#f1f5f9] text-black border border-gray-300' : ''}`}
            >
              {status === 'all' ? 'All Services' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Create a Service Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        <Card className="flex items-center justify-center h-40 sm:h-48 cursor-pointer border-dashed border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 transition" onClick={() => navigate('/create-service')}>
          <CardContent className="flex flex-col items-center justify-center w-full h-full p-4">
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mb-2" />
            <span className="font-semibold text-gray-700 text-sm sm:text-base text-center">Create a Service</span>
          </CardContent>
        </Card>
        {/* Service Cards */}
        {services.map((service: any) => {
          // Get the primary image or first image
          const primaryImage = service.images?.find((img: any) => img.isPrimary) || service.images?.[0];
          
          // Get the lowest price from all available plans
          const prices = [
            service.pricingPlans?.basic?.price || 0,
            service.pricingPlans?.standard?.price || 0,
            service.pricingPlans?.premium?.price || 0
          ].filter(price => price > 0);
          const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

          return (
            <Card 
              key={service._id} 
              className="relative group rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/services/${service._id}`)}
            >
              <div className="flex flex-col h-full">
                {/* Service Image */}
                <img
                  src={primaryImage?.url || placeholderImg}
                  alt={primaryImage?.alt || service.title}
                  className="w-full h-24 sm:h-32 lg:h-36 object-cover bg-gray-200"
                />
                <CardContent className="flex-1 flex flex-col p-3 sm:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-2 flex-wrap">
                    <Badge className="bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-medium">
                      {service.category || 'Category'}
                    </Badge>
                    <Badge className={getStatusColor(service.status) + ' rounded-full px-2 py-0.5 text-xs font-semibold'}>
                      {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'Active'}
                    </Badge>
                  </div>
                  <div className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">{service.title}</div>
                  <div className="text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2">{service.description}</div>
                  
                  {/* Pricing Plans */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                    {service.pricingPlans?.basic && (
                      <Button variant="outline" size="sm" className="rounded-full px-2 sm:px-3 py-1 text-xs">
                        ₹{service.pricingPlans.basic.price}
                      </Button>
                    )}
                    {service.pricingPlans?.standard && (
                      <Button variant="outline" size="sm" className="rounded-full px-2 sm:px-3 py-1 text-xs">
                        ₹{service.pricingPlans.standard.price}
                      </Button>
                    )}
                    {service.pricingPlans?.premium && (
                      <Button variant="outline" size="sm" className="rounded-full px-2 sm:px-3 py-1 text-xs">
                        ₹{service.pricingPlans.premium.price}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs sm:text-sm mt-auto">
                    <span className="text-gray-600">Item price</span>
                    <span className="font-bold text-black">₹{lowestPrice}</span>
                  </div>
                </CardContent>
                {/* 3-dot menu */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-gray-100 w-8 h-8 sm:w-10 sm:h-10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      // Add menu logic here if needed
                    }}
                  >
                    <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* No services fallback */}
      {services.length === 0 && (
        <Card className="rounded-xl sm:rounded-2xl shadow-md">
          <CardContent className="text-center py-12 sm:py-16 px-4">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Create your first service to start earning</p>
            <Button 
              onClick={() => navigate('/create-service')} 
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Create Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyServices;
