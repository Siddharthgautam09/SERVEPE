import { useState, useEffect } from "react";
import { Search, ArrowRight, Menu, TrendingUp, ChevronDown, Code, Edit, Palette, Video, User, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import LoginPopup from "@/components/LoginPopup";

// Import all images
import servpeLogo from "@/images/img_servpe_logo_black_txt_1.png";
import arrowDown from "@/images/img_arrowdown.svg";
import arrowDownGray from "@/images/img_arrowdown_gray_500.svg";
import arrowTrendUp from "@/images/img_arrowtrendup_1.svg";
import codeWindow from "@/images/img_codewindow_1.svg";
import employeeManAlt from "@/images/img_employeemanalt_1.svg";
import frame from "@/images/img_frame.svg";
import frameWhite from "@/images/img_frame_white_a700.svg";
import frameWhite28 from "@/images/img_frame_white_a700_28x28.svg";
import frame28 from "@/images/img_frame_28x28.svg";
import group16 from "@/images/img_group_16.svg";
import group36 from "@/images/img_group_36.png";
import group38 from "@/images/img_group_38.svg";
import group40 from "@/images/img_group_40.svg";
import marker from "@/images/img_marker_1.svg";
import maskGroup from "@/images/img_mask_group.png";
import profileImage from "@/images/img_profile_image_1.png";
import star from "@/images/img_star_1.svg";
import chatGptImage1 from "@/images/img_chatgpt_image_may_4_2025_101610_am_1.png";
import chatGptImage2 from "@/images/img_chatgpt_image_may_4_2025_101610_am_1_1.png";
import chatGptImage3 from "@/images/img_chatgpt_image_may_4_2025_101610_am_1_2.png";
import chatGptImage4 from "@/images/img_chatgpt_image_may_4_2025_101610_am_1_70x70.png";
import websiteFreelancer from "@/images/img_202506261839website_freelancer_listremix01jyp5kaqkfzvshvnrey4qpyjx_1.png";
import threeStepProcess from "@/images/img_202506261924threestep_process_flowremix01jyp85s9rfncb95exxsnv3x2s_1.png";
import taskCompletion from "@/images/img_202506261935task_completion_notificationremix01jyp8re9pfjp9yd2znvgrb73y_1.png";
import handsomeMan1 from "@/images/img_handsomesmilingyoungmanfolded260nw2069457431_1.png";
import handsomeMan2 from "@/images/img_handsomesmilingyoungmanfolded260nw2069457431_1_1.png";
import handsomeMan3 from "@/images/img_handsomesmilingyoungmanfolded260nw2069457431_1_2.png";
import handsomeMan4 from "@/images/img_handsomesmilingyoungmanfolded260nw2069457431_1_3.png";
import handsomeMan5 from "@/images/img_handsomesmilingyoungmanfolded260nw2069457431_1_45x45.png";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Login Popup */}
      <LoginPopup isOpen={showLoginPopup} onClose={handleCloseLoginPopup} />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto flex items-center h-[80px] px-6">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8">
            <button onClick={handleLogoClick} className="focus:outline-none">
              <img src={servpeLogo} alt="Servpe Logo" className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
            </button>
          </div>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 flex justify-center">
            <div className="relative w-full max-w-[350px]">
              <input 
                type="search" 
                placeholder="Search for services..." 
                className="w-full h-10 bg-gray-50 rounded-full px-5 text-[15px] text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400" 
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
          {/* Navigation Links & User */}
          <nav className="flex items-center space-x-7 ml-8" role="navigation">
            <button onClick={() => handleNavigation('/find-freelancers')} className="text-[16px] text-gray-700 font-medium hover:text-black transition-colors">Find Talents</button>
            <button onClick={() => handleNavigation('/services')} className="text-[16px] text-gray-700 font-medium hover:text-black transition-colors">Services</button>
            <button onClick={() => handleNavigation('/how-it-works')} className="text-[16px] text-gray-700 font-medium hover:text-black transition-colors">How it Works</button>
            <button onClick={() => handleNavigation('/ai-matching')} className="text-[16px] text-gray-700 font-medium hover:text-black transition-colors">AI Matching</button>
            <button onClick={() => handleNavigation('/book-call')} className="text-[16px] text-gray-700 font-medium hover:text-black transition-colors">Book a call</button>
            
            {/* User Profile */}
            {user ? (
              <UserMenu />
            ) : (
              <button onClick={handleUserProfileClick} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <img src={profileImage} alt="User Avatar" className="w-9 h-9 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-[16px] text-gray-700 font-medium">Login</span>
                <img src={arrowDown} alt="Dropdown" className="w-3 h-2" />
              </button>
            )}
          </nav>
        </div>
        {/* Service Categories Bar */}
        <div className="max-w-[1200px] mx-auto flex items-center space-x-6 h-10 px-6 border-t border-gray-100">
          <button onClick={() => handleCategoryClick('Social & SMM')} className="text-[15px] font-semibold text-black border-b-2 border-black pb-2">Social & SMM</button>
          <button onClick={() => handleCategoryClick('SEO')} className="text-[15px] text-gray-500 hover:text-black pb-2">SEO</button>
          <button onClick={() => handleCategoryClick('Copywriting')} className="text-[15px] text-gray-500 hover:text-black pb-2">Copywriting</button>
          <button onClick={() => handleCategoryClick('Web Development')} className="text-[15px] text-gray-500 hover:text-black pb-2">Web Development</button>
          <button onClick={() => handleCategoryClick('Script & Telegram Bots')} className="text-[15px] text-gray-500 hover:text-black pb-2">Script & Telegram Bots</button>
          <button onClick={() => handleCategoryClick('Logotypes & Branding')} className="text-[15px] text-gray-500 hover:text-black pb-2">Logotypes & Branding</button>
          <button onClick={() => handleCategoryClick('Web & Mobile Design')} className="text-[15px] text-gray-500 hover:text-black pb-2">Web & Mobile Design</button>
          <button onClick={() => handleCategoryClick('Scripts & Bots')} className="text-[15px] text-gray-500 hover:text-black pb-2">Scripts & Bots</button>
          <button onClick={() => handleCategoryClick('Video Editing')} className="text-[15px] text-gray-500 hover:text-black pb-2">Video Editing</button>
          <button onClick={() => handleNavigation('/services')} className="text-[15px] text-gray-500 hover:text-black flex items-center pb-2">
            All Services
            <img src={arrowDownGray} alt="Dropdown" className="w-3 h-2 ml-1" />
          </button>
        </div>
      </header>
      
      <div className="flex justify-center mt-[101px]">
        <div className="flex items-center bg-white border border-gray-200 rounded-[17px] px-6 py-4 h-[60px] w-[275px]">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <img src={maskGroup} alt="User 1" className="w-[30px] h-[30px] rounded-full" />
              <img src={handsomeMan1} alt="User 2" className="w-[30px] h-[30px] rounded-full" />
              <img src={handsomeMan2} alt="User 3" className="w-[30px] h-[30px] rounded-full" />
            </div>
            <span className="text-[18px] text-black ml-4">5k active users</span>
            <img src={arrowTrendUp} alt="Trending Up" className="w-[10px] h-[10px]" />
          </div>
        </div>
      </div>

      <section className="text-center px-4 mt-[60px]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[64px] font-medium leading-[82px] text-gray-700 mb-8">
            <span className="font-normal">Find India's</span>
            <span className="font-bold"> Top Talents</span>
            <span className="font-normal"> in Seconds</span><br />
            <span className="font-bold">Powered by AI</span>
          </h1>
          
          <p className="text-[20px] leading-[30px] text-gray-600 mb-12 max-w-4xl mx-auto">
            No more endless scrolling. Just tell us what you need - Servpe's AI finds your<br />
            perfect match in seconds.
          </p>

          <div className="relative max-w-3xl mx-auto mb-12">
            <input 
              type="search" 
              placeholder="What service are you looking for?" 
              className="w-full h-[80px] bg-white border-0 rounded-[16px] px-6 text-[14px] text-gray-600 shadow-sm" 
              onChange={handleMainSearch}
              aria-label="Main service search" 
            />
            </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                "Youtube shorts editing",
                "Youtube video editing", 
                "Graphic design",
                "AI services",
                "Youtube thumbnail",
              "Content writing"
            ].map((service) => (
              <button 
                key={service}
                onClick={() => handleQuickService(service)}
                className="bg-white border-0 rounded-[15px] px-4 py-3 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {service}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
                "Instagram reel editing",
                "Website development",
                "E-commerce solution",
                "Product marketing"
            ].map((service) => (
                <button
                key={service}
                onClick={() => handleQuickService(service)}
                className="bg-white border-0 rounded-[15px] px-4 py-3 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {service}
                </button>
              ))}
          </div>
        </div>
      </section>

      <div className="text-center mb-16">
        <button 
          className="bg-white border border-gray-200 rounded-[15px] px-8 py-4 text-[18px] text-black hover:bg-gray-50 transition-colors"
          onClick={() => handleNavigation('/services')}
        >
          Quick start
        </button>
      </div>

      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-[64px] font-normal leading-[75px] text-gray-700 mb-12">How Servpe works?</h2>

          <div className="bg-white border border-blue-200 rounded-[33px] inline-flex p-2 mb-16">
            <button 
              className="bg-blue-100 text-blue-600 rounded-[27px] px-8 py-4 text-[17px] transition-colors"
              role="tab"
              aria-selected="true"
            >
              For clients
              </button>
            <div className="flex items-center px-4">
              <img src={employeeManAlt} alt="Switch" className="w-[25px] h-[25px]" />
              <span className="text-[17px] text-gray-700 ml-2">For talents</span>
            </div>
          </div>

          <div className="space-y-16">
            <div className="relative">
              <div className="bg-white border border-blue-50 rounded-[30px] p-8 flex items-center justify-between max-w-4xl mx-auto">
                <img src={websiteFreelancer} alt="Select Service" className="w-[346px] h-[239px]" />
                <div className="ml-8">
                  <div className="bg-gray-100 rounded-[11px] w-[23px] h-[23px] flex items-center justify-center text-[16px] text-gray-600 mb-4">1</div>
                  <h3 className="text-[20px] font-medium text-gray-700 mb-2">Select your required service</h3>
                  <p className="text-[14px] leading-[20px] text-gray-600">Browse your required service or just use our AI Matching</p>
                </div>
              </div>
              <div className="absolute left-0 top-8 text-[128px] font-normal text-gray-200 opacity-40 pointer-events-none">1</div>
            </div>

            <div className="relative">
              <div className="bg-white border border-blue-50 rounded-[30px] p-8 flex items-center justify-between max-w-4xl mx-auto">
                <div className="relative">
                  <img src={threeStepProcess} alt="Submit Requirements" className="w-[346px] h-[257px]" />
                  <div className="absolute bottom-4 right-4 bg-blue-500 rounded-[15px] w-[30px] h-[29px] flex items-center justify-center">
                    <span className="text-[32px] font-medium text-white">₹</span>
                  </div>
                </div>
                <div className="ml-8">
                  <div className="bg-gray-100 rounded-[11px] w-[23px] h-[23px] flex items-center justify-center text-[16px] text-gray-600 mb-4">2</div>
                  <h3 className="text-[20px] font-medium text-gray-700 mb-2">Submit your requirments</h3>
                  <p className="text-[14px] leading-[20px] text-gray-600">Checkout - Submit requirements - Pay<br />and your order has been placed</p>
                </div>
              </div>
              <div className="absolute left-0 top-8 text-[128px] font-normal text-gray-200 opacity-40 pointer-events-none">2</div>
            </div>

            <div className="relative">
              <div className="bg-white border border-blue-50 rounded-[30px] p-8 flex items-center justify-between max-w-4xl mx-auto">
                <img src={taskCompletion} alt="Order Delivered" className="w-[346px] h-[217px]" />
                <div className="ml-8">
                  <div className="bg-gray-100 rounded-[11px] w-[23px] h-[23px] flex items-center justify-center text-[16px] text-gray-600 mb-4">3</div>
                  <h3 className="text-[20px] font-medium text-gray-700 mb-2">Order delivered</h3>
                  <p className="text-[14px] leading-[20px] text-gray-600">100% money back guarantee in case of failure to fulfill the order</p>
                </div>
              </div>
              <div className="absolute left-0 top-8 text-[128px] font-normal text-gray-200 opacity-40 pointer-events-none">3</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-[64px] font-medium leading-[75px] text-gray-700 mb-4">Top Talents</h2>
            <p className="text-[15px] leading-[18px] text-gray-600 mb-4">No endless searching. Just real freelancers, real work, real results</p>
            <div className="w-[439px] h-[1px] bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
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
                className="bg-white border border-gray-600 rounded-[20px] px-6 py-2 text-[16px] text-gray-600 hover:bg-gray-50"
              >
                {category}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                "Content Creation",
                "Video Editing",
                "Content Creation"
            ].map((category) => (
                <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="bg-white border border-gray-600 rounded-[20px] px-6 py-2 text-[16px] text-gray-600 hover:bg-gray-50"
              >
                {category}
                </button>
              ))}
          </div>

          <div className="grid grid-cols-4 gap-6 mb-12">
            {Array(4).fill(null).map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-[25px] p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start mb-6">
                  <img src={profileImage} alt="Suvajit Choudhury" className="w-[80px] h-[80px] rounded-[40px]" />
                  <div className="ml-4">
                    <h3 className="text-[18px] font-medium text-gray-700 mb-1">Suvajit Choudhury</h3>
                    <p className="text-[15px] text-gray-600 mb-4">Software Developer Engineer</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-50 rounded-[5px] px-3 py-1 text-[14px] text-gray-700">Java</span>
                  <span className="bg-blue-50 rounded-[5px] px-3 py-1 text-[14px] text-gray-700">Spring Boot</span>
                  <span className="bg-blue-50 rounded-[5px] px-3 py-1 text-[14px] text-gray-700">Backend dev</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-50 rounded-[5px] px-3 py-1 text-[14px] text-gray-700">AI development</span>
                  <span className="bg-blue-50 rounded-[5px] px-3 py-1 text-[14px] text-gray-700">DevOps</span>
                  <span className="bg-blue-50 rounded-[5px] px-3 py-1 text-[14px] text-gray-700">AI</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[16px] text-gray-700">Starts at ₹999</span>
                  <div className="flex items-center space-x-1">
                    <img src={star} alt="Star" className="w-[15px] h-[15px]" />
                    <span className="text-[16px] font-medium text-gray-700">4.9</span>
                    <span className="text-[11px] text-gray-600">(120 reviews)</span>
                  </div>
                </div>
                
                <p className="text-[13px] leading-[15px] text-gray-700 mb-4">Helping founders to build their MVP at large scale | Founder & CTO of Alfa Tech</p>
                
                <div className="flex items-center mb-6">
                  <img src={marker} alt="Location" className="w-[18px] h-[18px]" />
                  <span className="text-[16px] text-gray-700 ml-2">Bangalore, India</span>
                </div>
                
                <button 
                  className="w-full bg-blue-600 text-white rounded-[8px] py-3 text-[16px] font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => handleNavigation('/find-freelancers')}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mb-16">
            <button 
              className="text-[18px] font-medium text-white rounded-[12px] px-8 py-4 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(270deg, #71baff 0%, #bde4ff 100%)" }}
              onClick={() => handleNavigation('/find-freelancers')}
            >
              Explore All Top Talent
            </button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden mb-16">
        <div className="absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(235, 247, 255, 0.3) 0%, #ebf7ff 100%)" }}></div>
        <div className="absolute right-0 top-0 w-[895px] h-[366px]" style={{ background: "linear-gradient(270deg, #ebf7ff 0%, rgba(235, 247, 255, 0.3) 100%)" }}></div>
        
        <div className="relative px-4 py-16">
          <div className="flex justify-center space-x-8 mb-16">
            <div className="bg-blue-50 rounded-[18px] px-8 py-4">
              <span className="text-[22px] font-medium text-black">1k+</span>
              <span className="text-[22px] text-gray-600"> Order completed</span>
            </div>
            <button className="bg-blue-50 rounded-[18px] px-8 py-4 text-[22px] font-medium text-black">Trusted by 10k+</button>
            <div className="bg-blue-50 rounded-[18px] px-8 py-4">
              <span className="text-[22px] text-gray-600">100+ testimonials</span>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-[48px] font-bold leading-[57px] text-black mb-6">
              <span className="font-normal text-gray-700">They</span>
              <span className="font-bold text-black"> Asked. </span>
              <span className="font-normal text-gray-700">Servpe</span>
              <span className="font-bold text-black"> Delivered.</span>
            </h2>
            <p className="text-[24px] leading-[28px] text-gray-600 max-w-4xl mx-auto">
              Real freelancers, real results — see how businesses achieved success by hiring through Servpe.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-6 max-w-7xl mx-auto">
            {Array(5).fill(null).map((_, index) => (
              <div key={index} className="bg-white border-2 border-gray-100 rounded-[15px] p-6">
                <div className="flex items-center mb-4">
                  <img src={handsomeMan1} alt="Amit Kapoor" className="w-[45px] h-[45px] rounded-[22px]" />
                  <div className="ml-3">
                    <h4 className="text-[20px] font-medium text-black">Amit Kapoor</h4>
                    <span className="text-[15px] text-gray-600">01/06/2025</span>
                      </div>
                    </div>
                <p className="text-[18px] leading-[21px] text-gray-700">
                      Servpe helped me find the perfect video editor in 24 hours. My Instagram reel went viral!
                    </p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-5 gap-6 max-w-7xl mx-auto mt-6">
            {Array(5).fill(null).map((_, index) => (
              <div key={index} className="bg-white border-2 border-gray-100 rounded-[15px] p-6">
                <div className="flex items-center mb-4">
                  <img src={handsomeMan2} alt="Amit Kapoor" className="w-[45px] h-[45px] rounded-[22px]" />
                  <div className="ml-3">
                    <h4 className="text-[20px] font-medium text-black">Amit Kapoor</h4>
                    <span className="text-[15px] text-gray-600">01/06/2025</span>
                  </div>
                </div>
                <p className="text-[18px] leading-[21px] text-gray-700">
                  Servpe helped me find the perfect video editor in 24 hours. My Instagram reel went viral!
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start mb-8">
            <div>
              <h2 className="text-[64px] font-medium leading-[75px] text-gray-700 mb-4">Top Categories</h2>
              <p className="text-[15px] leading-[18px] text-gray-600 mb-4">No endless searching. Just real freelancers, real work, real results</p>
              <div className="w-[439px] h-[1px] bg-gray-300"></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
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
                className="bg-white border border-gray-600 rounded-[20px] px-6 py-2 text-[16px] text-gray-600 hover:bg-gray-50"
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              "Content Creation",
              "Video Editing",
              "Content Creation"
            ].map((category) => (
              <button 
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="bg-white border border-gray-600 rounded-[20px] px-6 py-2 text-[16px] text-gray-600 hover:bg-gray-50"
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-4 gap-6 mb-8">
            {Array(4).fill(null).map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-[20px] p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center mb-6">
                  <img src={chatGptImage1} alt="Video Editing" className="w-[70px] h-[70px] rounded-[10px] mx-auto mb-4" />
                  <h3 className="text-[16px] font-medium text-gray-700 mb-2">Video Editing & Animation</h3>
                  <div className="flex items-center justify-center space-x-2 text-[14px] text-gray-600 mb-4">
                    <span>300 service</span>
                    <div className="w-[1px] h-[22px] bg-gray-400"></div>
                    <span>1k+ orders</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">Motion Graphics</span>
                    <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">Animation</button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">Content Creation</button>
                    <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">Post Production</button>
                      </div>
                      </div>
              </div>
            ))}
                    </div>
                    
          <div className="grid grid-cols-4 gap-6 mb-12">
            {Array(4).fill(null).map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-[20px] p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center mb-6">
                  <img src={chatGptImage2} alt="Video Editing" className="w-[70px] h-[70px] rounded-[10px] mx-auto mb-4" />
                  <h3 className="text-[16px] font-medium text-gray-700 mb-2">Video Editing & Animation</h3>
                  <div className="flex items-center justify-center space-x-2 text-[14px] text-gray-600 mb-4">
                    <span>300 service</span>
                    <div className="w-[1px] h-[22px] bg-gray-400"></div>
                    <span>1k+ orders</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">Motion Graphics</span>
                    <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">Animation</button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">Content Creation</button>
                    <button className="bg-blue-50 rounded-[13px] px-3 py-1 text-[13px] text-gray-600">Post Production</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mb-16">
            <button 
              className="text-[18px] font-medium text-white rounded-[12px] px-8 py-4 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(270deg, #71baff 0%, #bde4ff 100%)" }}
              onClick={() => handleNavigation('/services')}
            >
              Explore All Categories
            </button>
          </div>
        </div>
      </section>

      <section className="text-center px-4 mt-16 mb-16">
        <h2 className="text-[36px] md:text-[44px] font-light leading-tight text-gray-900 mb-2">
          Not Sure <span className="font-semibold">What to Do Next?</span>
        </h2>
        <p className="text-[18px] md:text-[20px] leading-[30px] text-gray-500 mb-10 max-w-2xl mx-auto">
          Explore hand-picked categories — from design to development — and hire experts in just a few clicks, Powered by AI matching
        </p>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <button 
            onClick={() => handleCategoryClick('Software & Tech')}
            className="rounded-2xl p-6 flex flex-col items-center bg-[#ffeaea] border border-[#ffd6d6] shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={codeWindow} alt="Software & Tech" className="w-10 h-10 mb-3" />
            <div className="text-lg font-semibold text-gray-900 mb-1">Software & Tech</div>
            <div className="text-sm text-gray-500">Websites, apps, automations</div>
          </button>
          <button 
            onClick={() => handleCategoryClick('UI/UX Design')}
            className="rounded-2xl p-6 flex flex-col items-center bg-[#fff7e6] border border-[#ffe7b3] shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={group40} alt="UI/UX Design" className="w-10 h-10 mb-3" />
            <div className="text-lg font-semibold text-gray-900 mb-1">UI/UX Design</div>
            <div className="text-sm text-gray-500">Web & mobile interfaces</div>
          </button>
          <button 
            onClick={() => handleCategoryClick('Graphic Design')}
            className="rounded-2xl p-6 flex flex-col items-center bg-[#eaffea] border border-[#b3ffd6] shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={group38} alt="Graphic Design" className="w-10 h-10 mb-3" />
            <div className="text-lg font-semibold text-gray-900 mb-1">Graphic Design</div>
            <div className="text-sm text-gray-500">Branding, logos, banners</div>
          </button>
          <button 
            onClick={() => handleCategoryClick('Video Editing')}
            className="rounded-2xl p-6 flex flex-col items-center bg-[#eaf4ff] border border-[#b3d8ff] shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={group36} alt="Video Editing" className="w-10 h-10 mb-3" />
            <div className="text-lg font-semibold text-gray-900 mb-1">Video Editing</div>
            <div className="text-sm text-gray-500">Reels, YouTube, promos</div>
          </button>
          <button 
            onClick={() => handleCategoryClick('Software & Tech')}
            className="rounded-2xl p-6 flex flex-col items-center bg-[#ffeaea] border border-[#ffd6d6] shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={codeWindow} alt="Software & Tech" className="w-10 h-10 mb-3" />
            <div className="text-lg font-semibold text-gray-900 mb-1">Software & Tech</div>
            <div className="text-sm text-gray-500">Websites, apps, automations</div>
          </button>
          <button 
            onClick={() => handleCategoryClick('UI/UX Design')}
            className="rounded-2xl p-6 flex flex-col items-center bg-[#fff7e6] border border-[#ffe7b3] shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={group40} alt="UI/UX Design" className="w-10 h-10 mb-3" />
            <div className="text-lg font-semibold text-gray-900 mb-1">UI/UX Design</div>
            <div className="text-sm text-gray-500">Web & mobile interfaces</div>
          </button>
          <button 
            onClick={() => handleCategoryClick('Graphic Design')}
            className="rounded-2xl p-6 flex flex-col items-center bg-[#eaffea] border border-[#b3ffd6] shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={group38} alt="Graphic Design" className="w-10 h-10 mb-3" />
            <div className="text-lg font-semibold text-gray-900 mb-1">Graphic Design</div>
            <div className="text-sm text-gray-500">Branding, logos, banners</div>
          </button>
          <button 
            onClick={() => handleCategoryClick('Video Editing')}
            className="rounded-2xl p-6 flex flex-col items-center bg-[#eaf4ff] border border-[#b3d8ff] shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={group36} alt="Video Editing" className="w-10 h-10 mb-3" />
            <div className="text-lg font-semibold text-gray-900 mb-1">Video Editing</div>
            <div className="text-sm text-gray-500">Reels, YouTube, promos</div>
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <img src={servpeLogo} alt="Servpe Logo" className="h-[63px] w-[400px] mb-6" />
              <p className="text-[18px] leading-[22px] text-white mb-6">
                India's smart freelance marketplace powered by AI.
              </p>
              <div className="flex space-x-4">
                <img src={frame} alt="Social" className="w-[28px] h-[28px]" />
                <img src={frameWhite} alt="Social" className="w-[28px] h-[28px]" />
                <img src={frameWhite28} alt="Social" className="w-[28px] h-[28px]" />
                <img src={frame28} alt="Social" className="w-[28px] h-[28px]" />
              </div>
            </div>

            <div>
              <h3 className="text-[24px] font-medium text-white mb-6">For Clients</h3>
              <ul className="space-y-4">
                {[
                  { label: "Find Freelancers", path: "/find-freelancers" },
                  { label: "Browse Services", path: "/services" },
                  { label: "Book a call", path: "/book-call" },
                  { label: "How it Works (Clients)", path: "/how-it-works" }
                ].map((link) => (
                  <li key={link.label}>
                    <button 
                      className="text-[18px] text-white hover:text-gray-300"
                      onClick={() => handleNavigation(link.path)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[24px] font-medium text-white mb-6">For Freelancers</h3>
              <ul className="space-y-4">
                {[
                  { label: "Create Profile", path: "/profile" },
                  { label: "Portfolio Page", path: "/portfolio" },
                  { label: "Freelancer Dashboard", path: "/freelancer-dashboard" },
                  { label: "How it Works (Talent)", path: "/how-it-works" }
                ].map((link) => (
                  <li key={link.label}>
                    <button 
                      className="text-[18px] text-white hover:text-gray-300"
                      onClick={() => handleNavigation(link.path)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[24px] font-medium text-white mb-6">Company</h3>
              <ul className="space-y-4">
                {[
                  { label: "About Servpe", path: "/about" },
                  { label: "Our Vision", path: "/vision" },
                  { label: "Blog / Resources", path: "/blog" },
                  { label: "Careers", path: "/careers" }
                ].map((link) => (
                  <li key={link.label}>
                    <button 
                      className="text-[18px] text-white hover:text-gray-300"
                      onClick={() => handleNavigation(link.path)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            </div>

          <div className="grid grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-[24px] font-medium text-white mb-6">Support</h3>
              <ul className="space-y-4">
                {[
                  { label: "Help Center", path: "/help" },
                  { label: "FAQs", path: "/faq" },
                  { label: "Contact Us", path: "/contact" },
                  { label: "Report a Problem", path: "/report" }
                ].map((link) => (
                  <li key={link.label}>
                    <button 
                      className="text-[18px] text-white hover:text-gray-300"
                      onClick={() => handleNavigation(link.path)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-[24px] font-medium text-white mb-6">Legal</h3>
              <ul className="space-y-4">
                {[
                  { label: "Terms & Conditions", path: "/terms" },
                  { label: "Privacy Policy", path: "/privacy" },
                  { label: "Refund & Payment Policy", path: "/refund-policy" }
                ].map((link) => (
                  <li key={link.label}>
                    <button 
                      className="text-[18px] text-white hover:text-gray-300"
                      onClick={() => handleNavigation(link.path)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <p className="text-[16px] text-gray-400">
              © Servpe Innovations Pvt. Ltd. All rights reserved. 2025 | Made with ❤️ in india
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;