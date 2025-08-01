import React, { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, RefreshCw, Check, ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { serviceAPI } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ServiceOrderForm from '@/components/ServiceOrderForm';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Service, PricingPlan } from '@/types/service';
import { ApiResponse } from '@/types/api';

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');

  useEffect(() => {
    if (id) {
      loadService(id);
    }
  }, [id]);

  const loadService = async (serviceId: string) => {
    try {
      setLoading(true);
      const response: ApiResponse<Service> = await serviceAPI.getService(serviceId);
      
      if (response.success && response.data) {
        // Ensure the service data matches our Service type
        const serviceData: Service = {
          ...response.data,
          subcategory: response.data.subcategory || response.data.category,
          addOns: response.data.addOns?.map((addon: any) => ({
            title: addon.title || addon.name || 'Add-on',
            description: addon.description || 'Additional service',
            price: addon.price || 0,
            deliveryTime: addon.deliveryTime || 1
          })) || [],
          isActive: response.data.isActive ?? true,
          clicks: response.data.clicks || 0,
          status: response.data.status || 'active',
          averageRating: response.data.averageRating || 0,
          totalReviews: response.data.totalReviews || 0,
          impressions: response.data.impressions || 0,
          orders: response.data.orders || 0,
          images: response.data.images?.map((img: any) => ({
            url: img.url,
            alt: img.alt || response.data.title || 'Service image',
            isPrimary: img.isPrimary ?? false
          })) || [],
          pricingPlans: {
            basic: {
              title: response.data.pricingPlans?.basic?.title || 'Basic',
              description: response.data.pricingPlans?.basic?.description || 'Basic plan',
              price: response.data.pricingPlans?.basic?.price || 0,
              deliveryTime: response.data.pricingPlans?.basic?.deliveryTime || 1,
              revisions: response.data.pricingPlans?.basic?.revisions || 1,
              features: response.data.pricingPlans?.basic?.features || []
            },
            standard: response.data.pricingPlans?.standard ? {
              title: response.data.pricingPlans.standard.title || 'Standard',
              description: response.data.pricingPlans.standard.description || 'Standard plan',
              price: response.data.pricingPlans.standard.price || 0,
              deliveryTime: response.data.pricingPlans.standard.deliveryTime || 1,
              revisions: response.data.pricingPlans.standard.revisions || 1,
              features: response.data.pricingPlans.standard.features || []
            } : undefined,
            premium: response.data.pricingPlans?.premium ? {
              title: response.data.pricingPlans.premium.title || 'Premium',
              description: response.data.pricingPlans.premium.description || 'Premium plan',
              price: response.data.pricingPlans.premium.price || 0,
              deliveryTime: response.data.pricingPlans.premium.deliveryTime || 1,
              revisions: response.data.pricingPlans.premium.revisions || 1,
              features: response.data.pricingPlans.premium.features || []
            } : undefined
          }
        };
        setService(serviceData);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Load service error:', error);
      toast({
        title: "Error",
        description: "Failed to load service",
        variant: "destructive",
      });
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPlaced = (order: any) => {
    setShowOrderForm(false);
    navigate('/client/orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <Button onClick={() => navigate('/services')} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 rounded-lg mt-4">
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === service.freelancer._id;
  const availablePlans: [string, PricingPlan][] = Object.entries(service.pricingPlans).filter(
    ([_, plan]) => plan && plan.price
  ) as [string, PricingPlan][];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-12 shadow-md rounded-b-3xl mb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-white mr-2" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Service Details</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-2xl">Explore this service, compare plans, and connect with the freelancer</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-10">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Images */}
          <Card className="rounded-2xl shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <ImageWithFallback 
                  src={service.images?.[0]?.url} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                  fallbackClassName="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Title, badges, seller info */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {service.category.replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-400">Assured by servpe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={service.freelancer.profilePicture} />
                    <AvatarFallback>
                      {service.freelancer.firstName[0]}{service.freelancer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-gray-800">{service.freelancer.firstName} {service.freelancer.lastName}</span>
                  {service.freelancer.username && (
                    <span className="text-xs text-purple-600 font-mono">@{service.freelancer.username}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {service.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="border-purple-200 text-purple-700">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Description/About */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-lg mb-2">About This Service</h2>
            <p className="text-gray-600 leading-relaxed text-base mb-4">{service.description}</p>
          </div>

          {/* Pricing Plans (interactive, buy) */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Pricing Plans</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {availablePlans.map(([planName, plan]) => (
                <div 
                  key={planName}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    selectedPlan === planName 
                      ? 'border-purple-500 bg-purple-50 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                  onClick={() => setSelectedPlan(planName)}
                >
                  <div className="text-center mb-4">
                    <h4 className="font-semibold capitalize text-lg mb-1 text-purple-700">{planName}</h4>
                    <p className="text-3xl font-bold text-green-600">₹{plan.price}</p>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <span>{plan.deliveryTime} days delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-purple-400" />
                      <span>{plan.revisions} revisions</span>
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-1 mt-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Buy/Continue Button */}
            {!isOwner && (
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/checkout', { state: { service, selectedPlan } })}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-full shadow"
                  size="lg"
                >
                  Continue
                </Button>
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
              </div>
            )}
            {/* Order form modal if needed */}
            {showOrderForm && !isOwner && (
              <ServiceOrderForm 
                service={service} 
                onOrderPlaced={handleOrderPlaced}
              />
            )}
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Frequently asked question</h2>
            {/* Render FAQ here, use your logic or static content */}
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Customer Reviews</h2>
            <div className="flex items-center gap-8 mb-4">
              <div>
                <div className="text-2xl font-bold">10.0k</div>
                <div className="text-xs text-gray-500">Total Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-xs text-gray-500">Average Rating</div>
              </div>
              {/* Add rating bar if needed */}
            </div>
            {/* Render reviews here, use your logic */}
          </div>

          {/* Related Tags */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Related tags</h2>
            <div className="flex flex-wrap gap-2">
              {service.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="border-purple-200 text-purple-700">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* People Who Viewed This Service Also Loved */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-lg mb-4">People Who Viewed This Service Also Loved</h2>
            {/* Render related services here, use your logic or static content */}
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-8 lg:sticky lg:top-24 h-fit">
          {/* Seller Info and Service Stats only */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Service Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Orders Completed</span>
                <span className="font-medium">{service.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-medium">{service.averageRating.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time</span>
                <span className="font-medium">Within 1 hour</span>
              </div>
            </CardContent>
          </Card>
          {/* Add more seller info cards if needed */}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;