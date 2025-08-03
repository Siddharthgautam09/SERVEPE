import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, RefreshCw, Check, ArrowLeft, MessageSquare, Sparkles, Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { serviceAPI } from '@/api/services';
import { reviewAPI } from '@/api/reviews';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Service, PricingPlan } from '@/types/service';
import { ApiResponse } from '@/types/api';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  client: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  createdAt: string;
  isVerified: boolean;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (id) {
      loadService(id);
      loadReviews(id);
    }
  }, [id]);

  const loadService = async (serviceId: string) => {
    try {
      setLoading(true);
      const response: ApiResponse<Service> = await serviceAPI.getService(serviceId);
      
      if (response.success && response.data) {
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
              title: response.data.pricingPlans?.basic?.title || 'Lite',
              description: response.data.pricingPlans?.basic?.description || 'Basic plan',
              price: response.data.pricingPlans?.basic?.price || 0,
              deliveryTime: response.data.pricingPlans?.basic?.deliveryTime || 1,
              revisions: response.data.pricingPlans?.basic?.revisions || 1,
              features: response.data.pricingPlans?.basic?.features || []
            },
            standard: response.data.pricingPlans?.standard ? {
              title: response.data.pricingPlans.standard.title || 'Pro',
              description: response.data.pricingPlans.standard.description || 'Standard plan',
              price: response.data.pricingPlans.standard.price || 0,
              deliveryTime: response.data.pricingPlans.standard.deliveryTime || 1,
              revisions: response.data.pricingPlans.standard.revisions || 1,
              features: response.data.pricingPlans.standard.features || []
            } : undefined,
            premium: response.data.pricingPlans?.premium ? {
              title: response.data.pricingPlans.premium.title || 'Ultra',
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

  const loadReviews = async (serviceId: string) => {
    try {
      const response = await reviewAPI.getServiceReviews(serviceId, { limit: 10 });
      if (response.success) {
        setReviews(response.data || []);
      }
    } catch (error) {
      console.error('Load reviews error:', error);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Added to saved",
      description: isSaved ? "Service removed from your saved items" : "Service added to your saved items",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.title,
        text: service?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Service link copied to clipboard",
      });
    }
  };

  const nextImage = () => {
    if (service?.images && service.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === service.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (service?.images && service.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? service.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <Button onClick={() => navigate('/services')} className="bg-purple-600 text-white font-semibold px-6 rounded-lg mt-4">
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

  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <img src="/images/logo-2.png" alt="Logo" className="h-8 w-auto" />
                <span className="font-bold text-xl text-gray-800">SERVPE</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                <span className="ml-1 text-sm">1k+ saved</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Service Title and Category */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{service.category}</span>
            <span>•</span>
            <span className="text-green-600 font-medium">Assured by servpe</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Images */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <ImageWithFallback 
                    src={service.images?.[currentImageIndex]?.url || service.images?.[0]?.url} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                    fallbackClassName="w-full h-full"
                  />
                </div>
                
                {/* Image Navigation */}
                {service.images && service.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {service.images && service.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {service.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-purple-500' : 'border-gray-200'
                      }`}
                    >
                      <ImageWithFallback 
                        src={image.url} 
                        alt={`${service.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About This Service */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Service</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{service.description}</p>
              
              {/* Tech Stack */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">My Tech Stack</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Frontend</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>JavaScript</div>
                      <div>React</div>
                      <div>Next.js</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Backend</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Node.js</div>
                      <div>Express.js</div>
                      <div>PHP, Laravel</div>
                      <div>Python</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Databases & Others</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>MySQL</div>
                      <div>MongoDB</div>
                      <div>REST API Development</div>
                      <div>DevOps</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What I Can Build */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">What I Can Build For You</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>• Social Media or Blogging Platforms</div>
                  <div>• Project & Inventory Management Systems</div>
                  <div>• CRM / ERP / HR Solutions</div>
                  <div>• E-commerce Platforms</div>
                  <div>• Educational or Health-Tech Applications</div>
                  <div>• Real Estate or Booking Portals</div>
                  <div>• Membership Sites & Dashboards</div>
                  <div>• Portfolio Websites & Landing Pages</div>
                  <div>• Or... your next BIG idea!</div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    question: "Will I get refund my amount",
                    answer: "Yes, we offer a money-back guarantee if you're not satisfied with the service."
                  },
                  {
                    question: "Do you use templates or build everything from scratch?",
                    answer: "I build everything from scratch - no templates. Each project is custom-coded to your specific requirements."
                  },
                  {
                    question: "Can I request custom features for my platform?",
                    answer: "Absolutely! I can implement any custom features you need for your platform."
                  },
                  {
                    question: "Will my website be mobile-friendly and responsive?",
                    answer: "Yes, all websites I build are fully responsive and mobile-friendly."
                  },
                  {
                    question: "How do you handle revisions or changes?",
                    answer: "I provide multiple revisions as specified in your chosen package to ensure you're completely satisfied."
                  },
                  {
                    question: "Will you provide after-delivery support or maintenance?",
                    answer: "Yes, I provide ongoing support and maintenance services after delivery."
                  },
                  {
                    question: "Can you integrate third party APIs or services?",
                    answer: "Yes, I can integrate any third-party APIs or services you need for your project."
                  }
                ].map((faq, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <Plus className="w-4 h-4 text-gray-500" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 text-gray-600">
                      {faq.answer}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{totalReviews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{service.averageRating.toFixed(1)}</div>
                  <div className="flex items-center gap-1 justify-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= service.averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                
                {/* Rating Distribution */}
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600 w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${totalReviews > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {ratingDistribution[rating as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.slice(0, showAllReviews ? reviews.length : 4).map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.client.profilePicture} />
                        <AvatarFallback>
                          {review.client.firstName[0]}{review.client.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {review.client.firstName} {review.client.lastName}
                          </span>
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">Certified buyer</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {reviews.length > 4 && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4"
                >
                  {showAllReviews ? 'Show Less Reviews' : 'Show More Reviews'}
                </Button>
              )}
            </div>

            {/* Related Tags */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Tags</h2>
              <div className="flex flex-wrap gap-2">
                {service.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-gray-200 text-gray-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Related Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">People Who Viewed This Service Also Loved</h2>
              <div className="text-center text-gray-500 py-8">
                <p>Related services will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            {/* Pricing Plans */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Tabs value={selectedPlan} onValueChange={setSelectedPlan} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  {availablePlans.map(([planName, plan]) => (
                    <TabsTrigger key={planName} value={planName} className="text-xs">
                      {plan.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {availablePlans.map(([planName, plan]) => (
                  <TabsContent key={planName} value={planName}>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {formatPrice(plan.price)}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">{plan.description}</div>
                      
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Delivery in {plan.deliveryTime} Days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <RefreshCw className="w-4 h-4" />
                          <span>{plan.revisions} Times Revision</span>
                        </div>
                      </div>
                    </div>

                    {/* What's Included */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">What's Included in This Package</h4>
                      <div className="space-y-2">
                        {plan.features?.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Continue Button */}
                    {!isOwner && (
                      <Button 
                        onClick={() => navigate('/checkout', { state: { service, selectedPlan: planName } })}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Continue →
                      </Button>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Freelancer Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={service.freelancer.profilePicture} />
                  <AvatarFallback>
                    {service.freelancer.firstName[0]}{service.freelancer.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{service.freelancer.firstName} {service.freelancer.lastName}</h3>
                  <p className="text-sm text-gray-600">Co-founder, Servpe | Founder Dr. Ayusre | Content Creator</p>
                  <p className="text-sm text-gray-600">10+ years of experience</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= service.averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">{service.averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-600">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;