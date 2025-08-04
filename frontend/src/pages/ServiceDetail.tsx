import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, RefreshCw, Check, ArrowLeft, MessageSquare, Sparkles, Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus, Search } from 'lucide-react';
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

// Header/Index-specific imports
import servpeLogo from "@/images/img_servpe_logo_black_txt_1.png";
import profileImage from "@/images/img_profile_image_1.png";
import arrowDown from "@/images/img_arrowdown.svg";
import UserMenu from "@/components/UserMenu";

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

  // Header/search-specific state
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
  
  // Header / nav handlers
  const handleLogoClick = () => {
    if (user) {
      if (user.role === 'client') navigate('/client-dashboard');
      else if (user.role === 'freelancer') navigate('/freelancer-dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/role-selection');
    } else {
      navigate('/');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleUserProfileClick = () => {
    navigate('/login');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileSearchToggle = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMainSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
      <header className="bg-white w-full shadow-sm">
        <div className="w-full flex items-center h-[80px] px-4 md:px-6 lg:px-8 max-w-[1400px] mx-auto">
          {/* Logo and Search Container */}
          <div className="flex items-center flex-1 space-x-4 md:space-x-6 lg:space-x-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button onClick={handleLogoClick} className="focus:outline-none">
                <img
                  src={servpeLogo}
                  alt="Servpe Logo"
                  className="h-[28px] w-[140px] sm:h-[32px] sm:w-[160px] md:h-[36px] md:w-[180px] lg:h-[40px] lg:w-[200px] xl:h-[45px] xl:w-[260px] cursor-pointer hover:opacity-80 transition-opacity"
                />
              </button>
            </div>
            {/* Search Bar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex flex-1 max-w-[280px] lg:max-w-[320px] xl:max-w-[400px]">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search for services..."
                    className="w-full h-9 md:h-10 lg:h-11 bg-gray-50 rounded-full pl-0.5 pr-12 md:pl-1 md:pr-14 lg:pl-2 lg:pr-16 text-[14px] md:text-[15px] lg:text-[16px] xl:text-[18px] text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400 placeholder:text-[12px] md:placeholder:text-[13px] lg:placeholder:text-[14px]"
                    value={searchQuery}
                    onChange={handleMainSearch}
                    aria-label="Search for services"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button type="submit" className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-400" />
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Navigation Links & User */}
          <nav className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6" role="navigation">
            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-3">
              <button onClick={() => handleNavigation('/find-freelancers')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Find Talents</button>
              <button onClick={() => handleNavigation('/services')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Services</button>
              <button onClick={() => handleNavigation('/how-it-works')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">How it Works</button>
              <button onClick={() => handleNavigation('/ai-matching')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">AI Matching</button>
              <button onClick={() => handleNavigation('/book-call')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Book a call</button>
            </div>
            {/* Tablet Navigation */}
            <div className="hidden lg:flex xl:hidden items-center space-x-2">
              <button onClick={() => handleNavigation('/find-freelancers')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">Find Talents</button>
              <button onClick={() => handleNavigation('/services')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">Services</button>
              <button onClick={() => handleNavigation('/ai-matching')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">AI Matching</button>
            </div>
            {/* Medium Screen Navigation */}
            <div className="hidden md:flex lg:hidden items-center space-x-2">
              <button onClick={() => handleNavigation('/find-freelancers')} className="text-[12px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap">Find</button>
              <button onClick={() => handleNavigation('/services')} className="text-[12px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap">Services</button>
            </div>
            {/* Mobile Search Button */}
            <button className="md:hidden p-1.5 text-gray-600 hover:text-black transition-colors" onClick={handleMobileSearchToggle}>
              <Search className="h-5 w-5" />
            </button>
            {/* User Profile */}
            {user ? (
              <UserMenu />
            ) : (
              <button onClick={handleUserProfileClick} className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
                <div className="relative">
                  <img src={profileImage} alt="User Avatar" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="hidden sm:block text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] text-[#696D75] font-medium">Login</span>
                <img src={arrowDown} alt="Dropdown" className="hidden sm:block w-2 h-1.5 md:w-2.5 md:h-2 lg:w-3 lg:h-2" />
              </button>
            )}
            {/* Mobile Menu Button (Hamburger) */}
            <button
              className="lg:hidden p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0"
              onClick={handleMobileMenuToggle}
              aria-label="Open menu"
            >
              <span className="relative w-5 h-5 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-4 bg-gray-700 rounded transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                <span className={`block h-0.5 w-4 bg-gray-700 rounded my-0.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-4 bg-gray-700 rounded transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
              </span>
            </button>
          </nav>
        </div>
        {/* Mobile Search Bar */}
        <div className={`md:hidden px-4 pb-3 border-b border-gray-100 ${mobileSearchOpen ? 'block' : 'hidden'}`}>
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="search"
                placeholder="Search for services..."
                className="w-full h-10 bg-gray-50 rounded-full px-6 text-[15px] text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400 placeholder:text-[13px]"
                value={searchQuery}
                onChange={handleMainSearch}
                aria-label="Search for services"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </form>
        </div>
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={handleMobileMenuToggle}>
            <div className="absolute top-0 right-0 w-72 sm:w-80 h-full bg-white shadow-lg transform transition-transform duration-300">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold">Menu</h2>
                  <button onClick={handleMobileMenuToggle} className="p-2 rounded-full hover:bg-gray-100">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="space-y-3 sm:space-y-4">
                  <button onClick={() => { handleNavigation('/find-freelancers'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">Find Talents</button>
                  <button onClick={() => { handleNavigation('/services'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">Services</button>
                  <button onClick={() => { handleNavigation('/how-it-works'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">How it Works</button>
                  <button onClick={() => { handleNavigation('/ai-matching'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">AI Matching</button>
                  <button onClick={() => { handleNavigation('/book-call'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">Book a call</button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10 ">
        {/* Service Title and Category */}
        <div className="mb-6">
          <h1 className="max-w-3xl text-3xl font-bold text-[#3E3E3E] mb-2">{service.title}</h1>
          <div className="flex items-center gap-4 text-sm text-[#545454]">
            <span>{service.category}</span>
            <span>•</span>
            <span className="text-[#000000] font-medium">Assured by servpe</span>
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
                <div className="p-4 flex gap-2 overflow-x-auto justify-center">
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
    <div className="font-bold text-lg mb-2">
      <span className="bg-yellow-100 px-1 rounded">My Tech Stack:</span>
    </div>
    <ul className="list-disc pl-6 space-y-1 text-gray-700">
      <li>
        <span className="font-semibold">Frontend:</span> JavaScript, React, Next.js
      </li>
      <li>
        <span className="font-semibold">Backend:</span> Node.js, Express.js, PHP, Laravel, Python
      </li>
      <li>
        <span className="font-semibold">Databases:</span> MySQL, MongoDB
      </li>
      <li>
        <span className="font-semibold">Other:</span> REST API Development, DevOps
      </li>
    </ul>
  </div>

              {/* What I Can Build */}
              <div>
  <div className="font-bold text-lg mb-2">
    <span className="bg-yellow-100 px-1 rounded">
      What I Can Build For You:
    </span>
  </div>
  <ul className="list-disc pl-6 space-y-1 text-gray-700 text-[1.1rem]">
    <li>Social Media or Blogging Platforms</li>
    <li>Project & Inventory Management Systems</li>
    <li>CRM / ERP / HR Solutions</li>
    <li>E-commerce Platforms</li>
    <li>Educational or Health-Tech Applications</li>
    <li>Real Estate or Booking Portals</li>
    <li>Membership Sites & Dashboards</li>
    <li>Portfolio Websites & Landing Pages</li>
    <li>
      Or... your next <span className="font-bold">BIG idea!</span> <span role="img" aria-label="rocket">🚀</span>
    </li>
  </ul>
</div>


              {/* Freelancer Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">About the Freelancer</h3>
                <div className="flex items-start gap-3">
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
                    <div className="flex items-center gap-2 mt-2">
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

            {/* Message Button */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Button 
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-blue-600 border-blue-600"
                onClick={() => navigate(`/messages?user=${service.freelancer._id}`)}
              >
                <MessageSquare className="w-4 h-4" />
                Message Freelancer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;