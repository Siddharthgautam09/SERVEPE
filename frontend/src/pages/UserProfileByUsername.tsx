import {
  BadgeDollarSign,
  Bookmark,
  Landmark,
  MapPin,
  Star,
  Clock,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaLink,
  FaGithub,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useToast } from '@/hooks/use-toast';
import { userAPI } from '@/api/users';
import Loading from '@/components/Loading';
import { useParams, useNavigate } from 'react-router-dom';

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Static fallback data structure
  const fallbackItems = [
    {
      icon: <BadgeDollarSign className="w-[10px] h-[10px] text-white" />,
      text: "10+ Years",
    },
    {
      icon: <Landmark className="w-[10px] h-[10px] text-white" />,
      text: "Servpe",
    },
    {
      icon: <MapPin className="w-[10px] fill-white h-[10px] text-[#656565]" />,
      text: "Malda",
    },
  ];

  const fallbackSkills = [
    "Video Editing",
    "Programming",
    "Graphic",
    "Logo Designing",
    "Logo Designing",
    "Branding",
  ];

  const fallbackIcons = [
    <FaLink key="link" />,
    <FaLinkedin key="linkedin" />,
    <FaInstagram key="insta" />,
    <FaXTwitter key="twitter" />,
    <FaYoutube key="yt" />,
    <FaFacebook key="fb" />,
  ];

  // Load user profile on component mount
  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  const loadUserProfile = async () => {
    try {
      const response = await userAPI.getUserByUsername(username);
      if (response.success) {
        setProfileData(response.data);
      } else {
        toast({
          title: "Profile Not Found",
          description: "The user profile you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get social icon
  const getSocialIcon = (platform) => {
    const props = { className: "text-[#656565] fill-white", size: 12, strokeWidth: 1.5 };
    
    switch (platform.toLowerCase()) {
      case 'website': 
        return <FaLink {...props} />;
      case 'linkedin': 
        return <FaLinkedin {...props} />;
      case 'instagram': 
        return <FaInstagram {...props} />;
      case 'twitter': 
        return <FaXTwitter {...props} />;
      case 'youtube': 
        return <FaYoutube {...props} />;
      case 'facebook': 
        return <FaFacebook {...props} />;
      case 'github': 
        return <FaGithub {...props} />;
      default: 
        return <FaLink {...props} />;
    }
  };

  // Show loading state
  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  // Handle case where profile data is not available
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </div>
    );
  }

  const { user, services, reviews } = profileData;

  // Only show for freelancers
  if (user.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-gray-500">This profile is not available</p>
        </div>
      </div>
    );
  }

  // Dynamic data with fallbacks
  const items = [
    {
      icon: <BadgeDollarSign className="w-[10px] h-[10px] text-white" />,
      text: user.totalExperienceYears ? `${user.totalExperienceYears}+ Years` : "10+ Years",
    },
    {
      icon: <Landmark className="w-[10px] h-[10px] text-white" />,
      text: "Servpe",
    },
    {
      icon: <MapPin className="w-[10px] fill-white h-[10px] text-[#656565]" />,
      text: user.location?.city || "Malda",
    },
  ];

  const skills = user.skills?.length > 0 ? user.skills : (user.expertise?.length > 0 ? user.expertise : fallbackSkills);

  // Create icons array from social links or use fallback
  const icons = user.socialLinks ? 
    Object.entries(user.socialLinks).slice(0, 6).map(([platform, url]) => 
      getSocialIcon(platform)
    ) : fallbackIcons;

  // Format join date
  const joinDate = user.createdAt ? 
    new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
    "Sept, 2025";

  return (
    <div className="w-full flex flex-col">
      {/* Header with Back Button */}
      <div className="h-[90px] flex items-center border-b-[1px] w-full border-[#F5F5F5]">
        <div className="px-[156px]">
          <button 
            onClick={() => window.location.href = 'http://localhost:8081/freelancer/dashboard'}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-lg font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>
      
      <div className="px-[156px] w-full mt-[118px] flex flex-col">
        <div className="text-[#3A3A3A] border-[#EDEDED] rounded-[18px] w-[400px] border-[0.5px] shadow-[0px_0px_4px_0px_#0000000A]">
          <div className="flex flex-col gap-[16.69px] pl-[40.4px] pr-[37.46px]">
            <div className="flex">
              {/* Circular Profile Image */}
              <img
                src={user.profilePicture || "/imgg.png"}
                alt="Profile Image"
                className="w-[120px] h-[120px] mt-[-60px] rounded-full object-cover"
              />

              <div className="flex items-center ml-[27.4px] justify-between w-full max-w-xs">
                {/* Rating and Review Count */}
                <div className="flex flex-col items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-red-500 text-red-500" />
                    <span className="font-[700] text-[#1D1C22] text-sm">
                      {user.rating?.average?.toFixed(1) || '4.8'}
                    </span>
                  </div>
                  <span className="underline text-[12px] text-[#1D1C22]">
                    {user.rating?.count || '1k'} review
                  </span>
                </div>

                {/* Bookmark Icon */}
                <Bookmark className="w-[22px] cursor-pointer h-[22px] text-gray-800" />
              </div>
            </div>
            
            <div className="flex flex-col h-full">
              <h1 className="opacity-100 font-semibold text-[18px]">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-[15px] font-normal mt-[8px] text-[#3A3A3A]">
                {user.title || user.bio?.substring(0, 100) || "Co-founder & CEO - Servpe | Founder Dr. Ayusri's Labs Programmer, Entrepreneur | Good things takes time"}
              </p>
            </div>
            
            <section className="w-[322.12px]">
              <div className="border-t border-dashed border-[#A4A4A4] border-[1px]" />

              <div className="flex justify-between items-center px-[10px] py-[5px]">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    {/* Gradient circle */}
                    <div
                      className="w-[20px] h-[20px] rounded-full border border-[#A4A4A4] flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #656565 0%, #A4A4A4 100%)",
                      }}
                    >
                      {item.icon}
                    </div>

                    {/* Text */}
                    <span
                      className="text-[12px] text-black font-normal"
                      style={{
                        lineHeight: "100%",
                        letterSpacing: "0%",
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom dashed line */}
              <div className="border-t border-dashed border-[#A4A4A4] border-[1px]" />
            </section>

            <section className="w-[323px]">
              <div className="flex flex-wrap font-medium">
                <div className="flex flex-wrap items-center gap-[4px]">
                  <span className="font-[500] py-1 text-[14px] text-[#3A3A3A]">
                    Expertise
                  </span>
                  {skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-[4px] text-[13px] text-[#000000]"
                      style={{
                        fontWeight: 400,
                        lineHeight: "100%",
                        backgroundColor: "#F8F8F8",
                        border: "0.4px solid #E7E7E7",
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="w-[323px] pb-[47.6px]">
              <p className="text-[15px] font-[400] text-black">
                {user.bio ? (
                  user.bio.length > 120 ? (
                    <>
                      {user.bio.substring(0, 120)}...{" "}
                      <span className="text-[#074BEC] cursor-pointer font-[500]">
                        Read more
                      </span>
                    </>
                  ) : (
                    user.bio
                  )
                ) : (
                  <>
                    founder of Servpe, a modern freelance platform for India's
                    startups, creators, and MSMEs. On a mission to empower people...{" "}
                    <span className="text-[#074BEC] cursor-pointer font-[500]">
                      Read more
                    </span>
                  </>
                )}
              </p>
            </section>
          </div>
        </div>

        <div className="border-[0.5px] shadow-[0px_0px_4px_0px_#0000000A] mt-[25px] flex items-center mb-[20px] text-[#3A3A3A] border-[#EDEDED] rounded-[18px] h-[80px] w-[400px]">
          <section className="flex pl-[40px]">
            {/* Joined On Text */}
            <div className="flex flex-col">
              <span
                className="text-[11px]"
                style={{
                  fontWeight: 300,
                  lineHeight: "100%",
                  letterSpacing: "3%",
                }}
              >
                JOINED ON
              </span>
              <span
                className="text-[12px]"
                style={{
                  fontWeight: 400,
                  lineHeight: "100%",
                }}
              >
                {joinDate}
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center justify-between ml-[31px] space-x-[12px]">
              {user.socialLinks ? 
                Object.entries(user.socialLinks)
                  .filter(([_, url]) => url) // Filter out empty URLs
                  .slice(0, 6)
                  .map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[25px] cursor-pointer h-[25px] rounded-full flex items-center justify-center border"
                      style={{
                        background: "linear-gradient(180deg, #656565 0%, #A4A4A4 100%)",
                        borderColor: "#A4A4A4",
                        borderWidth: "0.5px",
                      }}
                    >
                      {getSocialIcon(platform)}
                    </a>
                  )) 
                : fallbackIcons.map((Icon, idx) => (
                  <div
                    key={idx}
                    className="w-[25px] cursor-pointer h-[25px] rounded-full flex items-center justify-center border"
                    style={{
                      background: "linear-gradient(180deg, #656565 0%, #A4A4A4 100%)",
                      borderColor: "#A4A4A4",
                      borderWidth: "0.5px",
                    }}
                  >
                    {Icon && React.cloneElement(Icon, {
                      className: "text-[#656565] fill-white",
                      size: 12,
                      strokeWidth: 1.5
                    })}
                  </div>
                ))
              }
            </div>
          </section>
        </div>

        <div className="flex-col border-[0.5px] shadow-[0px_0px_4px_0px_#0000000A] flex items-center pt-[22px] pb-[25px] text-[#3A3A3A] border-[#EDEDED] rounded-[18px] w-[400px] pl-[40px]">
          <section className="flex flex-col w-fit">
            {/* Top badges row */}
            <div className="flex items-center space-x-[12px]">
              {/* Rating Box */}
              <div className="flex items-center justify-center w-[55px] h-[30px] rounded-[18px] bg-[#F1F1F1] space-x-1">
                <Star className="w-[15px] h-[15px] fill-[#3E3E3E]" />
                <span
                  className="text-[14px] font-bold"
                  style={{
                    color: "#3E3E3E",
                    lineHeight: "100%",
                  }}
                >
                  {user.rating?.average?.toFixed(1) || '4.8'}
                </span>
              </div>

              {/* Popular Box */}
              <div className="w-[81.38px] h-[30px] rounded-[18px] bg-[#E4EFFF] flex items-center justify-center ml-[0px]">
                <span
                  className="text-[14px] font-medium"
                  style={{
                    color: "#074BEC",
                    lineHeight: "100%",
                  }}
                >
                  Popular
                </span>
              </div>
            </div>

            {/* Text Block */}
            <div className="mt-[18px]">
              <p
                className="text-[21px] font-semibold text-[#3E3E3E]"
                style={{
                  lineHeight: "100%",
                }}
              >
                Need help? want to talk with me book the consultation call now
              </p>

              <p
                className="text-[16px] font-normal text-[#696D75] mt-[13px]"
                style={{
                  lineHeight: "100%",
                }}
              >
                Not sure about the quality?
              </p>
            </div>
          </section>
          
          <div className="flex items-center w-full mt-[27.5px] justify-between px-[13.9px] py-2 bg-[#F1F1F1] rounded-[15px]">
            {/* Left Section: Calendar + Text */}
            <div className="flex items-center gap-[10px] pr-[19px]">
              {/* Calendar Icon */}
              <Clock className="w-[28px] h-[28px] text-[#ADADAD] py-[16px]" />

              {/* Texts */}
              <div className="flex flex-col">
                <span className="font-medium text-[16px] text-[#3E3E3E] leading-none">
                  30 mins
                </span>
                <span className="text-[11px] mt-[1px] font-normal text-[#565656] leading-none">
                  Video Meeting
                </span>
              </div>
            </div>

            {/* Right Section: Price Button */}
            <button
              className="flex items-center justify-center w-[135px] h-[36px] border border-[#3E3E3E] rounded-[54.23px] bg-[#F1F1F1] cursor-pointer hover:bg-[#E4E4E4] transition-colors duration-200 ease-in-out"
              style={{ marginRight: "13.9px" }}
            >
              {/* ₹2,300 (strikethrough) */}
              <span className="text-[13px] mr-[5.39px] text-[#696D75] line-through">
                ₹2,300
              </span>

              {/* ₹1,100 */}
              <span className="text-[16px] text-[#3E3E3E] font-medium">
                ₹1,100
              </span>

              {/* Arrow Icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3E3E3E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
