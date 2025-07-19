import { useState, useEffect } from "react";
import { Search, ArrowRight, Menu, TrendingUp, ChevronDown, Code, Edit, Palette, Video, User, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import LoginPopup from "@/components/LoginPopup";

// Import all images
import servpeLogo from "@/images/images/img_servpe_logo_black_txt_1.png";
import arrowDown from "@/images/images/img_arrowdown.svg";
import arrowDownGray from "@/images/images/img_arrowdown_gray_500.svg";
import arrowTrendUp from "@/images/images/img_arrowtrendup_1.svg";
import codeWindow from "@/images/images/img_codewindow_1.svg";
import employeeManAlt from "@/images/images/img_employeemanalt_1.svg";
import frame from "@/images/images/img_frame.svg";
import frameWhite from "@/images/images/img_frame_white_a700.svg";
import frameWhite28 from "@/images/images/img_frame_white_a700_28x28.svg";
import frame28 from "@/images/images/img_frame_28x28.svg";
import group16 from "@/images/images/img_group_16.svg";
import group36 from "@/images/images/img_group_36.png";
import group38 from "@/images/images/img_group_38.svg";
import group40 from "@/images/images/img_group_40.svg";
import marker from "@/images/images/img_marker_1.svg";
import maskGroup from "@/images/images/img_mask_group.png";
import profileImage from "@/images/images/img_profile_image_1.png";
import star from "@/images/images/img_star_1.svg";
import chatGptImage1 from "@/images/images/img_chatgpt_image_may_4_2025_101610_am_1.png";
import chatGptImage2 from "@/images/images/img_chatgpt_image_may_4_2025_101610_am_1_1.png";
import chatGptImage3 from "@/images/images/img_chatgpt_image_may_4_2025_101610_am_1_2.png";
import chatGptImage4 from "@/images/images/img_chatgpt_image_may_4_2025_101610_am_1_70x70.png";
import websiteFreelancer from "@/images/images/img_202506261839website_freelancer_listremix01jyp5kaqkfzvshvnrey4qpyjx_1.png";
import threeStepProcess from "@/images/images/img_202506261924threestep_process_flowremix01jyp85s9rfncb95exxsnv3x2s_1.png";
import taskCompletion from "@/images/images/img_202506261935task_completion_notificationremix01jyp8re9pfjp9yd2znvgrb73y_1.png";
import handsomeMan1 from "@/images/images/Rectangle3.png";
import handsomeMan2 from "@/images/images/img_handsomesmilingyoungmanfolded260nw2069457431_1_1.png";
import handsomeMan3 from "@/images/images/img_handsomesmilingyoungmanfolded260nw2069457431_1_2.png";
import handsomeMan4 from "@/images/images/img_handsomesmilingyoungmanfolded260nw2069457431_1_3.png";
import handsomeMan5 from "@/images/images/img_handsomesmilingyoungmanfolded260nw2069457431_1_45x45.png";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Add missing state for mobile menu and search toggles
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Show login popup on page load for non-authenticated users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setShowLoginPopup(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleMainSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/services?category=${encodeURIComponent(category)}`);
  };

  const handleQuickService = (service: string) => {
    navigate(`/services?search=${encodeURIComponent(service)}`);
  };

  const handleLogoClick = () => {
    if (user) {
      // If user is logged in, go to dashboard based on role
      if (user.role === 'client') {
        navigate('/client-dashboard');
      } else if (user.role === 'freelancer') {
        navigate('/freelancer-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/role-selection');
      }
    } else {
      // If not logged in, go to login page
      navigate('/email-otp-login');
    }
  };

  const handleUserProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/email-otp-login');
    }
  };

  // Add missing handlers for mobile menu and search toggles
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
    // Close mobile search if menu is opened
    if (!mobileMenuOpen) setMobileSearchOpen(false);
  };

  const handleMobileSearchToggle = () => {
    setMobileSearchOpen((prev) => !prev);
    // Close mobile menu if search is opened
    if (!mobileSearchOpen) setMobileMenuOpen(false);
  };

  // Auto-scroll functionality for testimonials
  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      let topScrollPosition = 0;
      let bottomScrollPosition = 0;
      
      const topInterval = setInterval(() => {
        const container = document.querySelector('.testimonials-row-1') as HTMLElement;
        if (container && container.scrollWidth > container.clientWidth) {
          const maxScroll = container.scrollWidth - container.clientWidth;
          topScrollPosition -= 1; // Move from right to left
          
          if (topScrollPosition <= 0) {
            topScrollPosition = maxScroll;
          }
          
          container.scrollTo({
            left: topScrollPosition,
            behavior: 'auto'
          });
        }
      }, 30); // Slightly slower for smoother movement

      const bottomInterval = setInterval(() => {
        const container = document.querySelector('.testimonials-row-2') as HTMLElement;
        if (container && container.scrollWidth > container.clientWidth) {
          const maxScroll = container.scrollWidth - container.clientWidth;
          bottomScrollPosition += 1; // Move from left to right
          
          if (bottomScrollPosition >= maxScroll) {
            bottomScrollPosition = 0;
          }
          
          container.scrollTo({
            left: bottomScrollPosition,
            behavior: 'auto'
          });
        }
      }, 25); // Different speed for independent movement

      return () => {
        clearInterval(topInterval);
        clearInterval(bottomInterval);
      };
    }, 1000); // Wait 1 second for DOM to be ready

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const [visibleCards, setVisibleCards] = useState(4);
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  const [autoScrollTop, setAutoScrollTop] = useState(0);
  const [autoScrollBottom, setAutoScrollBottom] = useState(0);

  return (
    <div className="min-h-screen bg-white w-screen overflow-hidden animate-fade-in" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Login Popup */}
      <LoginPopup isOpen={showLoginPopup} onClose={handleCloseLoginPopup} />
      
      {/* Header */}
      <header className="bg-white w-full shadow-sm animate-slide-down">
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
      {/* Desktop Navigation - Only visible on large screens */}
      <div className="hidden xl:flex items-center space-x-3">
        <button onClick={() => handleNavigation('/find-freelancers')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Find Talents</button>
        <button onClick={() => handleNavigation('/services')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Services</button>
        <button onClick={() => handleNavigation('/how-it-works')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">How it Works</button>
        <button onClick={() => handleNavigation('/ai-matching')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">AI Matching</button>
        <button onClick={() => handleNavigation('/book-call')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Book a call</button>
      </div>

      {/* Tablet Navigation - Hidden on mobile and desktop */}
      <div className="hidden lg:flex xl:hidden items-center space-x-2">
        <button onClick={() => handleNavigation('/find-freelancers')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">Find Talents</button>
        <button onClick={() => handleNavigation('/services')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">Services</button>
        <button onClick={() => handleNavigation('/ai-matching')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">AI Matching</button>
      </div>

      {/* Medium Screen Navigation - Hidden on mobile and large screens */}
      <div className="hidden md:flex lg:hidden items-center space-x-2">
        <button onClick={() => handleNavigation('/find-freelancers')} className="text-[12px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap">Find</button>
        <button onClick={() => handleNavigation('/services')} className="text-[12px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap">Services</button>
      </div>

      {/* Mobile Search Button - Only visible on mobile */}
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

  {/* Mobile Search Bar - Only visible on mobile when toggled */}
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

  {/* Service Categories Bar */}
{/* Service Categories Bar - ALIGNED WITH HEADER */}
<div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 bg-white border-gray-100">
  <div className="flex items-center justify-center h-10 sm:h-11 md:h-12 space-x-6 sm:space-x-8 md:space-x-10 lg:space-x-12 xl:space-x-16"
>

    <button onClick={() => handleCategoryClick('Social & SMM')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] font-semibold text-[#989CA4] border-b-2 border-black pb-2 whitespace-nowrap hover:text-black transition-colors">Social & SMM</button>
    <button onClick={() => handleCategoryClick('SEO')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-[#989CA4] hover:text-black pb-2 whitespace-nowrap transition-colors">SEO</button>
    <button onClick={() => handleCategoryClick('Copywriting')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-[#989CA4] hover:text-black pb-2 whitespace-nowrap transition-colors">Copywriting</button>
    <button onClick={() => handleCategoryClick('Web Development')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-[#989CA4] hover:text-black pb-2 whitespace-nowrap transition-colors">Web Dev</button>
    <button onClick={() => handleCategoryClick('Script & Telegram Bots')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-[#989CA4] hover:text-black pb-2 whitespace-nowrap transition-colors">Scripts</button>
    <button onClick={() => handleCategoryClick('Logotypes & Branding')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-[#989CA4] hover:text-black pb-2 whitespace-nowrap transition-colors">Branding</button>
    <button onClick={() => handleCategoryClick('Web & Mobile Design')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500 hover:text-black pb-2 whitespace-nowrap transition-colors">Design</button>
    <button onClick={() => handleCategoryClick('Scripts & Bots')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500 hover:text-black pb-2 whitespace-nowrap transition-colors">Bots</button>
    <button onClick={() => handleCategoryClick('Video Editing')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500 hover:text-black pb-2 whitespace-nowrap transition-colors">Video</button>
    <button onClick={() => handleNavigation('/services')} className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-gray-500 hover:text-black flex items-center pb-2 whitespace-nowrap transition-colors">
      All Services
      <img src={arrowDownGray} alt="Dropdown" className="w-2 h-1.5 sm:w-2.5 sm:h-2 md:w-3 md:h-2 ml-1" />
    </button>
  </div>
</div>
</header>
<div className="flex justify-center mt-[60px] sm:mt-[70px] md:mt-[80px] lg:mt-[90px] xl:mt-[101px] px-4 animate-fade-in-up">
  <div className="flex items-center bg-white border border-gray-200 rounded-[12px] sm:rounded-[14px] md:rounded-[15px] lg:rounded-[16px] xl:rounded-[17px] px-3 sm:px-4 md:px-5 lg:px-5 xl:px-6 py-2 sm:py-3 md:py-3 lg:py-3.5 xl:py-4 h-[45px] sm:h-[50px] md:h-[55px] lg:h-[58px] xl:h-[60px] w-[200px] sm:w-[220px] md:w-[240px] lg:w-[260px] xl:w-[275px] hover:scale-105 transition-all duration-300">
    <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
      <div className="flex -space-x-1 sm:-space-x-1.5 md:-space-x-2">
        <img src={maskGroup} alt="User 1" className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px] xl:w-[30px] xl:h-[30px] rounded-full" />
        <img src={handsomeMan1} alt="User 2" className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px] xl:w-[30px] xl:h-[30px] rounded-full" />
        <img src={handsomeMan2} alt="User 3" className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px] xl:w-[30px] xl:h-[30px] rounded-full" />
      </div>
      <span className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] text-black ml-2 sm:ml-3 md:ml-3.5 lg:ml-4 font-medium">5k active users</span>
      <img src={arrowTrendUp} alt="Trending Up" className="w-[8px] h-[8px] sm:w-[9px] sm:h-[9px] md:w-[9px] md:h-[9px] lg:w-[10px] lg:h-[10px]" />
    </div>
  </div>
</div>


<section className="text-center px-4 sm:px-6 md:px-8 lg:px-12 mt-[30px] sm:mt-[40px] md:mt-[50px] lg:mt-[60px] animate-fade-in-up">
        <div className="max-w-6xl mx-auto">
    <h1 className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] xl:text-[64px] font-medium leading-[36px] sm:leading-[44px] md:leading-[60px] lg:leading-[72px] xl:leading-[82px] text-gray-700 mb-4 sm:mb-6 md:mb-8 animate-slide-up">
      <span className="font-normal">Find India's</span>
      <span className="font-bold"> Top Talents</span>
      <span className="font-normal"> in Seconds</span><br />
      <span className="font-bold">Powered by AI</span>
    </h1>
    
        <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] leading-[22px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-[#989CA4] mb-8 sm:mb-10 md:mb-12 max-w-full sm:max-w-3xl md:max-w-4xl mx-auto animate-fade-in-up">
      No more endless scrolling. Just tell us what you need - Servpe's AI finds your<br className="hidden md:block" />
            perfect match in seconds.
          </p>
    
    <div className="relative max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 animate-fade-in-up">
      {/* Search Icon Image on the left */}
      <img
        src="/src/images/search-line.png"
        alt="Search Icon"
        className="absolute left-3 sm:left-4 md:left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 animate-pulse"
      />
      
      {/* Right Rectangle Image with Arrow Icon */}
      <div className="absolute top-1/2 right-3 sm:right-4 md:right-5 transform -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 animate-bounce">
        <img
          src="/src/images/Rectangle3.png"
          alt="Rectangle"
          className="w-full h-full object-cover rounded-[3px] sm:rounded-[4px]"
        />
        <img
          src="/src/images/arrowiconx.png"
          alt="Arrow"
          className="absolute top-1/2 left-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
        />
      </div>
      
      {/* Search Input */}
                  <input 
              type="search" 
        placeholder='Describe your requirements... (e.g. "E-commerce website, Video editing, content creation")' 
        className="w-full h-[60px] sm:h-[70px] md:h-[80px] bg-white border border-[#D0DEFF] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] pl-10 sm:pl-12 md:pl-14 pr-12 sm:pr-14 md:pr-16 text-[12px] sm:text-[13px] md:text-[14px] text-gray-600 shadow-sm placeholder-gray-400 placeholder:text-[11px] sm:placeholder:text-[12px] md:placeholder:text-[13px] transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-blue-300" 
              onChange={handleMainSearch}
              aria-label="Main service search" 
            />
    </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 animate-fade-in-up">
              {[
                "Youtube shorts editing",
                "Youtube video editing", 
                "Graphic design",
                "AI services",
                "Youtube thumbnail",
              "Content writing"
            ].map((service, index) => (
              <button 
                key={service}
                onClick={() => handleQuickService(service)}
          className="bg-white border border-[#D0DEFF] rounded-[12px] sm:rounded-[15px] px-3 sm:px-4 py-2 sm:py-3 text-[13px] sm:text-[14px] md:text-[15px] text-gray-600 hover:bg-gray-50 hover:scale-105 hover:shadow-md transition-all duration-300 whitespace-nowrap animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {service}
              </button>
            ))}
          </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 sm:mb-14 md:mb-16 animate-fade-in-up">
            {[
                "Instagram reel editing",
                "Website development",
                "E-commerce solution",
                "Product marketing"
            ].map((service, index) => (
                <button
                key={service}
                onClick={() => handleQuickService(service)}
          className="bg-white border border-[#D0DEFF] rounded-[12px] sm:rounded-[15px] px-3 sm:px-4 py-2 sm:py-3 text-[13px] sm:text-[14px] md:text-[15px] text-gray-600 hover:bg-gray-50 hover:scale-105 hover:shadow-md transition-all duration-300 whitespace-nowrap animate-fade-in-up"
                style={{ animationDelay: `${(index + 6) * 100}ms` }}
              >
                {service}
                </button>
              ))}
          </div>
  </div>
</section>
<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-white animate-fade-in-up">
  {/* Header */}
  <div className="text-center mb-8 sm:mb-10 lg:mb-12 font-roboto animate-slide-up">
    <h1 className="text-2xl sm:text-3xl lg:text-[64px] font-light text-gray-800 mb-3 sm:mb-4 px-2">
      Not Sure <span className="font-semibold">What to Do Next?</span>
    </h1>
    <p className="text-sm sm:text-base lg:text-lg text-gray-500 max-w-2xl mx-auto px-4">
      Explore hand-picked categories — from design to development — and hire experts in just a few clicks, Powered by AI matching
    </p>
  </div>

  {/* Categories Grid */}
  <div className="border-2 border-gray-200 rounded-lg overflow-hidden max-w-4xl mx-auto animate-fade-in-up">
    <div className="grid grid-cols-2 sm:grid-cols-4">
      
      {/* Software & Tech - 1 */}
      <div className="relative p-4 sm:p-5 lg:p-6 cursor-pointer bg-white hover:bg-gray-50 hover:scale-105 border-b border-r border-gray-200 transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
            <div className="relative">
              <img 
                src="/src/images/ep1.png" 
                alt="Software & Tech" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <img 
                src="/src/images/cw2.png" 
                alt="Small icon" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800">Software & Tech</h3>
        </div>
      </div>

      {/* UI/UX Design - 1 */}
      <div className="relative p-4 sm:p-5 lg:p-6 cursor-pointer bg-white hover:bg-gray-50 hover:scale-105 border-b border-gray-200 sm:border-r transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
            <div className="relative">
              <img 
                src="/src/images/ep1.png" 
                alt="UI/UX Design" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <img 
                src="/src/images/cw3.png" 
                alt="Small icon" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800">UI/UX Design</h3>
        </div>
      </div>

      {/* Graphic Design - 1 */}
      <div className="relative p-4 sm:p-5 lg:p-6 cursor-pointer bg-white hover:bg-gray-50 hover:scale-105 border-b border-r border-gray-200 transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
            <div className="relative">
              <img 
                src="/src/images/ep1.png" 
                alt="Graphic Design" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <img 
                src="/src/images/cw4.png" 
                alt="Small icon" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800">Graphic Design</h3>
        </div>
      </div>

      {/* Video Editing - 1 */}
      <div className="relative p-4 sm:p-5 lg:p-6 cursor-pointer bg-white hover:bg-gray-50 hover:scale-105 border-b border-gray-200 transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
            <div className="relative">
              <img 
                src="/src/images/ep1.png" 
                alt="Video Editing" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <img 
                src="/src/images/cw5.png" 
                alt="Small icon" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800">Video Editing</h3>
        </div>
      </div>

      {/* Software & Tech - 2 */}
      <div className="relative p-4 sm:p-5 lg:p-6 cursor-pointer bg-white hover:bg-gray-50 hover:scale-105 border-r border-b border-gray-200 transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
            <div className="relative">
              <img 
                src="/src/images/ep1.png" 
                alt="Software & Tech" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <img 
                src="/src/images/cw2.png" 
                alt="Small icon" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800">Software & Tech</h3>
        </div>
      </div>

      {/* UI/UX Design - 2 */}
      <div className="relative p-4 sm:p-5 lg:p-6 cursor-pointer bg-white hover:bg-gray-50 hover:scale-105 border-r border-b border-gray-200 transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
            <div className="relative">
              <img 
                src="/src/images/ep1.png" 
                alt="UI/UX Design" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <img 
                src="/src/images/cw3.png" 
                alt="Small icon" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800">UI/UX Design</h3>
        </div>
      </div>

      {/* Graphic Design - 2 */}
      <div className="relative p-4 sm:p-5 lg:p-6 cursor-pointer bg-white hover:bg-gray-50 hover:scale-105 border-r border-gray-200 transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
            <div className="relative">
              <img 
                src="/src/images/ep1.png" 
                alt="Graphic Design" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <img 
                src="/src/images/cw4.png" 
                alt="Small icon" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800">Graphic Design</h3>
        </div>
      </div>

      {/* Video Editing - 2 */}
      <div className="relative p-4 sm:p-5 lg:p-6 cursor-pointer bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
            <div className="relative">
              <img 
                src="/src/images/ep1.png" 
                alt="Video Editing" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <img 
                src="/src/images/cw5.png" 
                alt="Small icon" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800">Video Editing</h3>
        </div>
      </div>

    </div>
  </div>
</div>

<section className="px-4 mb-8 sm:mb-12 lg:mb-16 mt-8 sm:mt-12 lg:mt-16">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-3xl sm:text-4xl lg:text-[64px] font-medium leading-tight sm:leading-[50px] lg:leading-[75px] text-gray-700 mb-3 sm:mb-4">Top Categories</h2>
      <p className="text-sm sm:text-[15px] leading-relaxed sm:leading-[18px] text-gray-600 mb-4 px-2">No endless searching. Just real freelancers, real work, real results</p>
      <div className="w-full max-w-[439px] h-[1px] bg-gray-300 mx-auto"></div>
    </div>
    
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        {[
          "All",
          "IT Services", 
          "Technology",
          "Content Creation",
          "Video Editing",
          "Content Creation"
      ].map((category) => (
          <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className="bg-white border border-gray-600 rounded-[20px] px-4 sm:px-6 py-2 text-sm sm:text-[16px] text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {category}
          </button>
        ))}
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
        {[
          "Content Creation",
          "Video Editing",
          "Content Creation"
      ].map((category) => (
          <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className="bg-white border border-gray-600 rounded-[20px] px-4 sm:px-6 py-2 text-sm sm:text-[16px] text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {category}
          </button>
        ))}
    </div>

    {/* Category Buttons */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
  {Array(4).fill(null).map((_, index) => (
    <div
      key={index}
      className="bg-white border border-gray-200 rounded-[20px] p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="text-center mb-6">
        <img
          src={chatGptImage2}
          alt="Video Editing"
          className="w-[70px] h-[70px] rounded-[10px] mx-auto mb-4"
        />
        <h3 className="text-[16px] font-medium text-gray-700 mb-2">
          Video Editing & Animation
        </h3>

        <div className="flex items-center justify-center space-x-2 text-[14px] text-gray-600 mb-4">
          <span>300 service</span>
          <div className="w-[1px] h-[22px] bg-gray-400"></div>
          <span>1k+ orders</span>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">
            Motion Graphics
          </span>
          <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">
            Animation
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">
            Content Creation
          </button>
          <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">
            Post Production
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
  {Array(4).fill(null).map((_, index) => (
    <div
      key={index}
      className="bg-white border border-gray-200 rounded-[20px] p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="text-center mb-6">
        <img
          src={chatGptImage2}
          alt="Video Editing"
          className="w-[70px] h-[70px] rounded-[10px] mx-auto mb-4"
        />
        <h3 className="text-[16px] font-medium text-gray-700 mb-2">
          Video Editing & Animation
        </h3>

        <div className="flex items-center justify-center space-x-2 text-[14px] text-gray-600 mb-4">
          <span>300 service</span>
          <div className="w-[1px] h-[22px] bg-gray-400"></div>
          <span>1k+ orders</span>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">
            Motion Graphics
          </span>
          <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">
            Animation
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">
            Content Creation
          </button>
          <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">
            Post Production
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
{/*Explore All categories button*/}
<div className="text-center mt-16 mb-16 px-4 sm:px-6">
  <button 
    className="text-base sm:text-lg md:text-xl font-medium text-white rounded-xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 transition-all duration-200 hover:scale-105 active:scale-95"
    style={{ background: "linear-gradient(270deg, #71baff 0%, #bde4ff 100%)" }}
    onClick={() => handleNavigation('/services')}
  >
    Explore All Categories
  </button>
</div>

{/*quick start*/ }
      <div className="text-center mb-16 mt-12">
        <button 
          className="bg-white border border-gray-200 rounded-[15px] px-8 py-4 text-[18px] text-black hover:bg-gray-50 transition-colors"
          onClick={() => handleNavigation('/services')}
        >
          Quick start
        </button>
      </div>

      {/*how servpe works*/}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
  <div className="max-w-6xl mx-auto text-center font-['Roboto']">
    <h2 className="text-3xl sm:text-4xl md:text-[64px] font-normal leading-tight text-[#3E3E3E] mb-12">
      How Servpe works?
    </h2>
    <div className="inline-flex items-center bg-white border border-blue-200 rounded-[33px] px-2 py-2 mb-16">
  {/* For Clients Button */}
  <button
    className="flex items-center text-gray-700 font-roboto rounded-[27px] px-6 py-3 text-[16px] sm:text-[17px] transition-all duration-200 hover:bg-[#EEF4FF] hover:text-[#074BEC]"
    role="tab"
    aria-selected="true"
  >
    <img
      src={employeeManAlt}
      alt="Clients Icon"
      className="w-[25px] h-[25px] mr-2"
    />
    For clients
  </button>

  {/* For Talents Button */}
  <button
    className="flex items-center text-gray-700 font-roboto rounded-[27px] px-6 py-3 text-[16px] sm:text-[17px] transition-all duration-200 hover:bg-[#EEF4FF] hover:text-[#074BEC]"
    role="tab"
    aria-selected="false"
  >
    <img
      src={employeeManAlt}
      alt="Talents Icon"
      className="w-[25px] h-[25px] mr-2"
    />
    For talents
  </button>
</div>

{/*1,2,3 cards*/}
<div className="space-y-16">
  {[1, 2, 3].map((step, index) => {
    const stepData = [
      {
        img: websiteFreelancer,
        title: "Select your required service",
        desc: "Browse your required service or just use our AI Matching",
      },
      {
        img: threeStepProcess,
        title: "Submit your requirements",
        desc: "Checkout - Submit requirements - Pay\nand your order has been placed",
      },
      {
        img: taskCompletion,
        title: "Order delivered",
        desc: "100% money back guarantee in case of failure to fulfill the order",
      },
    ][index];

    return (
      <div className="relative" key={index}>
  {/* Large background number - moved closer to the box */}
  <div className="absolute -left-[40px] top-1/2 -translate-y-1/2 text-[120px] sm:text-[160px] font-light text-gray-300 opacity-50 pointer-events-none z-0">
    {step}
  </div>

  {/* Main container with proper spacing */}
  <div className="relative z-10 max-w-5xl mx-auto">
  {/* Step content box */}
  <div className="bg-white rounded-[24px] shadow-lg p-8 sm:p-10 ml-[20px] sm:ml-[30px]">
    {/* Two clear divisions with space between */}
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
      {/* Division 1 - Image */}
      <div className="flex-shrink-0 w-full lg:w-[350px]">
        <img
          src={stepData.img}
          alt={stepData.title}
          className="w-full h-auto rounded-[16px]"
        />
      </div>

      {/* Division 2 - Content (text left-aligned) */}
      <div className="flex-1 text-left">
        {/* Small step number badge - moved here as pointer */}
        <div className="bg-gray-100 rounded-full w-[32px] h-[32px] flex items-center justify-center text-[14px] text-gray-600 mb-6">
          {step}
        </div>
        
        <h3 className="text-[22px] sm:text-[24px] font-semibold text-gray-800 mb-4 leading-tight text-left">
          {stepData.title}
        </h3>
        <p className="text-[16px] leading-[24px] text-gray-600 whitespace-pre-line text-left">
          {stepData.desc}
        </p>
      </div>
    </div>
  </div>
</div>
</div>);
  })}
</div>
  </div>
</section>

<section className="px-4 mb-8 sm:mb-12 lg:mb-16 mt-16 sm:mt-20 lg:mt-35">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-3xl sm:text-4xl lg:text-[64px] font-medium leading-tight sm:leading-[50px] lg:leading-[75px] text-gray-700 mb-3 sm:mb-4">Top Talents</h2>
      <p className="text-sm sm:text-[15px] leading-relaxed sm:leading-[18px] text-gray-600 mb-4 px-2">No endless searching. Just real freelancers, real work, real results</p>
      <div className="w-full max-w-[439px] h-[1px] bg-gray-300 mx-auto"></div>
    </div>
    
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
      {[
        "All",
        "IT Services", 
        "Technology",
        "Content Creation",
        "Video Editing",
        "Content Creation"
      ].map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className="bg-white border border-gray-600 rounded-[20px] px-4 sm:px-6 py-2 text-sm sm:text-[16px] text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {category}
        </button>
      ))}
    </div>
      
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
      {[
        "Content Creation",
        "Video Editing",
        "Content Creation"
      ].map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className="bg-white border border-gray-600 rounded-[20px] px-4 sm:px-6 py-2 text-sm sm:text-[16px] text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {category}
        </button>
      ))}
    </div>
  </div>
</section>
  {/*profile cards*/}
{/*profile cards*/}
<div className="w-full">
  {/* Horizontal scrolling container */}
  <div className="relative overflow-hidden">
    <div 
      id="cardsContainer"
      className="flex gap-4 sm:gap-6 transition-transform duration-300 ease-in-out overflow-x-auto scrollbar-none"
      style={{ 
        transform: `translateX(-${currentScrollPosition * (320 + 24)}px)`,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {Array(12).fill(null).map((_, index) => {
        const cardsData = [
          {
            id: 1,
            name: "Suvajit Choudhury",
            title: "Software Developer Engineer",
            skills: ["Java", "Spring Boot", "Backend dev", "AI development", "DevOps", "AI"],
            price: "₹999",
            rating: 4.9,
            reviews: 120,
            description: "Helping founders to build their MVP at large scale | Founder & CTO of Alfa Tech",
            location: "Bangalore, India",
            image: profileImage
          },
          {
            id: 2,
            name: "Suvajit Choudhury",
            title: "Software Developer Engineer",
            skills: ["Java", "Spring Boot", "Backend dev", "AI development", "DevOps", "AI"],
            price: "₹999",
            rating: 4.9,
            reviews: 120,
            description: "Helping founders to build their MVP at large scale | Founder & CTO of Alfa Tech",
            location: "Bangalore, India",
            image: profileImage
          },
          {
            id: 3,
            name: "Suvajit Choudhury",
            title: "Software Developer Engineer",
            skills: ["Java", "Spring Boot", "Backend dev", "AI development", "DevOps", "AI"],
            price: "₹999",
            rating: 4.9,
            reviews: 120,
            description: "Helping founders to build their MVP at large scale | Founder & CTO of Alfa Tech",
            location: "Bangalore, India",
            image: profileImage
          },
          {
            id: 4,
            name: "Suvajit Choudhury",
            title: "Software Developer Engineer",
            skills: ["Java", "Spring Boot", "Backend dev", "AI development", "DevOps", "AI"],
            price: "₹999",
            rating: 4.9,
            reviews: 120,
            description: "Helping founders to build their MVP at large scale | Founder & CTO of Alfa Tech",
            location: "Bangalore, India",
            image: profileImage
          }
        ];

        // Use modulo to cycle through the 4 cards
        const card = cardsData[index % 4];
        
        return (
          <div 
            key={`card-${index}`} 
            className="bg-white border border-gray-200 rounded-[20px] sm:rounded-[25px] p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex-shrink-0 animate-fade-in-up"
            style={{ 
              width: '320px',
              animationDelay: `${index * 150}ms`
            }}
          >
            {/* Profile Header */}
            <div className="flex items-start mb-3 sm:mb-4">
              <img 
                src={card.image} 
                alt={card.name} 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-[50px] lg:h-[50px] rounded-full object-cover flex-shrink-0" 
              />
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-base lg:text-[16px] font-medium text-gray-800 mb-1 truncate">
                  {card.name}
                </h3>
                <p className="text-xs sm:text-xs md:text-sm lg:text-[14px] text-gray-600">
                  {card.title}
                </p>
              </div>
            </div>
            
            {/* Skills Tags - First Row */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
              {card.skills.slice(0, 3).map((skill, skillIndex) => (
                <span key={skillIndex} className="bg-blue-50 rounded-[6px] sm:rounded-[8px] px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-xs md:text-xs lg:text-[12px] text-gray-700">
                  {skill}
                </span>
              ))}
            </div>
            
            {/* Skills Tags - Second Row */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {card.skills.slice(3, 6).map((skill, skillIndex) => (
                <span key={skillIndex} className="bg-blue-50 rounded-[6px] sm:rounded-[8px] px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-xs md:text-xs lg:text-[12px] text-gray-700">
                  {skill}
                </span>
              ))}
            </div>
            
            {/* Price and Rating */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm md:text-sm lg:text-[14px] text-gray-800 font-medium">
                Starts at {card.price}
              </span>
              <div className="flex items-center space-x-1">
                <img 
                  src={star} 
                  alt="Star" 
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-[14px] lg:h-[14px]" 
                />
                <span className="text-xs sm:text-sm md:text-sm lg:text-[14px] font-medium text-gray-800">
                  {card.rating}
                </span>
                <span className="text-xs sm:text-xs md:text-xs lg:text-[12px] text-gray-600">
                  ({card.reviews} reviews)
                </span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-xs sm:text-xs md:text-xs lg:text-[12px] leading-relaxed text-gray-700 mb-3 sm:mb-4 line-clamp-2">
              {card.description}
            </p>
            
            {/* Location */}
            <div className="flex items-center mb-3 sm:mb-4">
              <img 
                src={marker} 
                alt="Location" 
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-[14px] lg:h-[14px] flex-shrink-0" 
              />
              <span className="text-xs sm:text-xs md:text-xs lg:text-[12px] text-gray-700 ml-1 sm:ml-2 truncate">
                {card.location}
              </span>
            </div>
            
            {/* View Profile Button */}
            <button 
              className="w-full bg-blue-600 text-white rounded-[6px] sm:rounded-[8px] py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-xs md:text-sm lg:text-[14px] font-medium hover:bg-blue-700 hover:scale-105 transition-all duration-300"
              onClick={() => handleNavigation('/find-freelancers')}
            >
              View Profile
            </button>
          </div>
        );
      })}
    </div>
  </div>

  {/* Arrow Button - Horizontal scroll functionality */}
  <div className="flex justify-end mb-6 sm:mb-8 mt-4 sm:mt-6 animate-fade-in-up">
    <button 
      className="bg-white border border-gray-300 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-300 shadow-sm animate-pulse"
      onClick={() => setCurrentScrollPosition(prev => prev + 1)}
    >
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="sm:w-5 sm:h-5"
      >
        <path 
          d="M6 12L10 8L6 4" 
          stroke="#374151" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
</div>

{/* Explore All Top Talent Button */}
    <div className="text-center mb-8 sm:mb-16 animate-fade-in-up">
            <button 
        className="text-base sm:text-[18px] font-medium text-white rounded-[12px] px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto animate-pulse"
              style={{ background: "linear-gradient(270deg, #71baff 0%, #bde4ff 100%)" }}
        onClick={() => handleNavigation('/find-freelancers')}
            >
        Explore All Top Talent
            </button>
          </div>
  </div>
</section>

{/* Testimonials Section */}
{/* Testimonials Section */}
<section className="relative overflow-hidden mb-16 animate-fade-in-up">
  {/* Background gradients */}
  <div className="absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(235, 247, 255, 0.3) 0%, #ebf7ff 100%)" }}></div>
  <div className="absolute right-0 top-0 w-[895px] h-[366px]" style={{ background: "linear-gradient(270deg, #ebf7ff 0%, rgba(235, 247, 255, 0.3) 100%)" }}></div>
  
  {/* Enhanced blur effect on edges - no sharp edges */}
  <div className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r from-white via-white/90 via-white/70 via-white/50 to-transparent z-10 pointer-events-none blur-sm"></div>
  <div className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l from-white via-white/90 via-white/70 via-white/50 to-transparent z-10 pointer-events-none blur-sm"></div>
  
  <div className="relative px-4 py-8 sm:py-16">
    {/* Stats Section */}
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-8 sm:mb-16 animate-fade-in-up">
      <div className="bg-blue-50 rounded-[18px] px-4 sm:px-8 py-3 sm:py-4 hover:scale-105 transition-all duration-300 animate-bounce">
        <span className="text-[16px] sm:text-[22px] font-medium text-black">1k+</span>
        <span className="text-[16px] sm:text-[22px] text-gray-600"> Order completed</span>
      </div>
      <button className="bg-blue-50 rounded-[18px] px-4 sm:px-8 py-3 sm:py-4 text-[16px] sm:text-[22px] font-medium text-black hover:scale-105 transition-all duration-300 animate-bounce">
        Trusted by 10k+
      </button>
      <div className="bg-blue-50 rounded-[18px] px-4 sm:px-8 py-3 sm:py-4 hover:scale-105 transition-all duration-300 animate-bounce">
        <span className="text-[16px] sm:text-[22px] text-gray-600">100+ testimonials</span>
      </div>
    </div>

        {/* Title Section */}
    <div className="text-center mb-8 sm:mb-16 animate-fade-in-up">
      <h2 className="text-[24px] sm:text-[36px] lg:text-[48px] font-bold leading-tight text-black mb-4 sm:mb-6 animate-slide-up">
        <span className="font-normal text-gray-700">They</span>
        <span className="font-bold text-black"> Asked. </span>
        <span className="font-normal text-gray-700">Servpe</span>
        <span className="font-bold text-black"> Delivered.</span>
        </h2>
      <p className="text-[16px] sm:text-[20px] lg:text-[24px] leading-relaxed text-gray-600 max-w-4xl mx-auto px-4">
        Real freelancers, real results — see how businesses achieved success by hiring through Servpe.
      </p>
    </div>

        {/* Two Row Testimonials Layout - Vertical Stacking */}
    <div className="relative max-w-7xl mx-auto">

      {/* First Row - Top testimonials */}
      <div 
        className="testimonials-row-1 overflow-x-auto scrollbar-none px-12 sm:px-16 mb-6"
        style={{ 
          scrollSnapType: 'x mandatory',
          maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="flex space-x-4 sm:space-x-6 pb-4 animate-fade-in">
          {Array(12).fill(null).map((_, index) => (
            <div
              key={`row1-${index}`}
              className="bg-white border-2 border-gray-100 rounded-[15px] p-4 sm:p-6 flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px] transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up"
              style={{ 
                scrollSnapAlign: 'start',
                opacity: '0.9',
                filter: 'blur(0px)',
                transition: 'opacity 0.5s ease, filter 0.5s ease, transform 0.3s ease',
                animationDelay: `${index * 100}ms`
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.opacity = '1';
                target.style.filter = 'blur(0px)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.opacity = '0.9';
              }}
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <img 
                  src={index % 2 === 0 ? handsomeMan1 : handsomeMan2} 
                  alt="Testimonial Person" 
                  className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] rounded-[22px] object-cover transition-transform duration-300 hover:scale-110" 
                />
                <div className="ml-3">
                  <h4 className="text-[16px] sm:text-[20px] font-medium text-black">
                    Amit Kapoor
                  </h4>
                  <span className="text-[13px] sm:text-[15px] text-gray-600">01/06/2025</span>
                </div>
              </div>
              <p className="text-[14px] sm:text-[16px] lg:text-[18px] leading-relaxed text-gray-700">
                Servpe helped me find the perfect video editor in 24 hours. My Instagram reel went viral!
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Second Row - Bottom testimonials directly below first row */}
      <div 
        className="testimonials-row-2 overflow-x-auto scrollbar-none px-12 sm:px-16"
        style={{ 
          scrollSnapType: 'x mandatory',
          maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="flex space-x-4 sm:space-x-6 pb-4 animate-fade-in">
          {Array(12).fill(null).map((_, index) => (
            <div
              key={`row2-${index}`}
              className="bg-white border-2 border-gray-100 rounded-[15px] p-4 sm:p-6 flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px] transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up"
              style={{ 
                scrollSnapAlign: 'start',
                opacity: '0.9',
                filter: 'blur(0px)',
                transition: 'opacity 0.5s ease, filter 0.5s ease, transform 0.3s ease',
                animationDelay: `${(index + 12) * 100}ms`
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.opacity = '1';
                target.style.filter = 'blur(0px)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.opacity = '0.9';
              }}
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <img 
                  src={index % 2 === 0 ? handsomeMan2 : handsomeMan1} 
                  alt="Testimonial Person" 
                  className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] rounded-[22px] object-cover transition-transform duration-300 hover:scale-110" 
                />
                <div className="ml-3">
                  <h4 className="text-[16px] sm:text-[20px] font-medium text-black">
                    Amit Kapoor
                  </h4>
                  <span className="text-[13px] sm:text-[15px] text-gray-600">01/06/2025</span>
                </div>
              </div>
              <p className="text-[14px] sm:text-[16px] lg:text-[18px] leading-relaxed text-gray-700">
                Servpe helped me find the perfect video editor in 24 hours. My Instagram reel went viral!
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>

{/* Footer Section */}
<footer className="bg-black text-white animate-fade-in-up">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      {/* Logo and Description Section - Shifted Left */}
      <div className="col-span-1 md:col-span-1 lg:col-span-1">
        <img 
          src={servpeLogo} 
          alt="Servpe Logo" 
          className="h-[35px] sm:h-[40px] lg:h-[50px] w-auto mb-3 sm:mb-4 -ml-1 sm:-ml-2 hover:scale-105 transition-all duration-300" 
        />
        <p className="text-[13px] sm:text-[14px] lg:text-[16px] leading-relaxed text-gray-300 mb-3 sm:mb-4">
          India's smart freelance marketplace<br />
          powered by AI.
        </p>
                <div className="flex space-x-2 sm:space-x-3">
          <img src={frame} alt="Social" className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] hover:opacity-80 hover:scale-110 cursor-pointer transition-all duration-300" />
          <img src={frameWhite} alt="Social" className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] hover:opacity-80 hover:scale-110 cursor-pointer transition-all duration-300" />
          <img src={frameWhite28} alt="Social" className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] hover:opacity-80 hover:scale-110 cursor-pointer transition-all duration-300" />
          <img src={frame28} alt="Social" className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] hover:opacity-80 hover:scale-110 cursor-pointer transition-all duration-300" />
              </div>
      </div>

      {/* For Clients */}
      <div className="col-span-1">
        <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-white mb-3 sm:mb-4 whitespace-nowrap">For Clients</h3>
        <ul className="space-y-1 sm:space-y-2 lg:space-y-3">
          {[
            { label: "Find Freelancers", path: "/find-freelancers" },
            { label: "Browse Services", path: "/services" },
            { label: "Book a call", path: "/book-call" },
            { label: "How it Works (Clients)", path: "/how-it-works" }
          ].map((link) => (
            <li key={link.label}>
              <button 
                className="text-[13px] sm:text-[14px] lg:text-[16px] text-gray-400 hover:text-white transition-colors duration-200 text-left"
                onClick={() => handleNavigation(link.path)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* For Freelancers */}
      <div className="col-span-1">
        <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-white mb-3 sm:mb-4 whitespace-nowrap">For Freelancers</h3>
        <ul className="space-y-1 sm:space-y-2 lg:space-y-3">
          {[
            { label: "Create Profile", path: "/profile" },
            { label: "Portfolio Page", path: "/portfolio" },
            { label: "Freelancer Dashboard", path: "/freelancer-dashboard" },
            { label: "How it Works (Talent)", path: "/how-it-works" }
          ].map((link) => (
            <li key={link.label}>
              <button 
                className="text-[13px] sm:text-[14px] lg:text-[16px] text-gray-400 hover:text-white transition-colors duration-200 text-left"
                onClick={() => handleNavigation(link.path)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Company */}
      <div className="col-span-1">
        <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-white mb-3 sm:mb-4 whitespace-nowrap">Company</h3>
        <ul className="space-y-1 sm:space-y-2 lg:space-y-3">
          {[
            { label: "About Servpe", path: "/about" },
            { label: "Our Vision", path: "/vision" },
            { label: "Blog / Resources", path: "/blog" },
            { label: "Careers", path: "/careers" }
          ].map((link) => (
            <li key={link.label}>
              <button 
                className="text-[13px] sm:text-[14px] lg:text-[16px] text-gray-400 hover:text-white transition-colors duration-200 text-left"
                onClick={() => handleNavigation(link.path)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Support */}
      <div className="col-span-1">
        <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-white mb-3 sm:mb-4 whitespace-nowrap">Support</h3>
        <ul className="space-y-1 sm:space-y-2 lg:space-y-3">
          {[
            { label: "Help Center", path: "/help" },
            { label: "FAQs", path: "/faq" },
            { label: "Contact Us", path: "/contact" },
            { label: "Report a Problem", path: "/report" }
          ].map((link) => (
            <li key={link.label}>
              <button 
                className="text-[13px] sm:text-[14px] lg:text-[16px] text-gray-400 hover:text-white transition-colors duration-200 text-left"
                onClick={() => handleNavigation(link.path)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal - Now alongside Support */}
      <div className="col-span-1">
        <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-white mb-3 sm:mb-4 whitespace-nowrap">Legal</h3>
        <ul className="space-y-1 sm:space-y-2 lg:space-y-3">
          {[
            { label: "Terms & Conditions", path: "/terms" },
            { label: "Privacy Policy", path: "/privacy" },
            { label: "Refund & Payment Policy", path: "/refund-policy" }
          ].map((link) => (
            <li key={link.label}>
              <button 
                className="text-[13px] sm:text-[14px] lg:text-[16px] text-gray-400 hover:text-white transition-colors duration-200 text-left"
                onClick={() => handleNavigation(link.path)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Copyright Section - Centered */}
    <div className="border-t border-gray-800 pt-6 sm:pt-8">
      <p className="text-[13px] sm:text-[14px] lg:text-[16px] text-gray-500 text-center">
        © Servpe Innovations Pvt. Ltd. All rights reserved. 2025 | Made with ❤️ in india
      </p>
    </div>
  </div>
</footer>

    </div>
  );
};

export default Index;