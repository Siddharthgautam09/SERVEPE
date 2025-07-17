
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Bookmark, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userAPI } from '@/api/users';
import Loading from '@/components/Loading';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaLink,
  FaGithub
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const UserProfileByUsername = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  const loadUserProfile = async () => {
    try {
      const response = await userAPI.getUserByUsername(username!);
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
    } catch (error: any) {
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

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

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

  // Helper function to get social icon
  const getSocialIcon = (platform: string) => {
    const props = { className: "text-white", size: 12 };
    
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

  // Helper function to get profile item icon
  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'experience':
        return <Clock className="w-[10px] h-[10px] text-white" />;
      case 'company':
        return <div className="w-[10px] h-[10px] bg-white rounded-sm text-[8px] flex items-center justify-center text-gray-600 font-bold">S</div>;
      case 'location':
        return <MapPin className="w-[10px] fill-white h-[10px] text-white" />;
      default:
        return <Clock className="w-[10px] h-[10px] text-white" />;
    }
  };

  // Prepare profile items
  const profileItems = [];
  
  if (user.totalExperienceYears) {
    profileItems.push({
      key: 'experience',
      type: 'experience',
      text: `${user.totalExperienceYears}+ Years`,
    });
  }
  
  if (user.companyBrand) {
    profileItems.push({
      key: 'company',
      type: 'company',
      text: user.companyBrand,
    });
  }
  
  if (user.location) {
    const locationText = typeof user.location === 'string' 
      ? user.location 
      : `${user.location?.city || ''}${user.location?.city && user.location?.country ? ', ' : ''}${user.location?.country || ''}`;
    
    if (locationText) {
      profileItems.push({
        key: 'location',
        type: 'location',
        text: locationText,
      });
    }
  }

  // Prepare social links
  const socialLinks = [];
  if (user.socialLinks) {
    if (user.socialLinks.website) socialLinks.push({ type: 'website', url: user.socialLinks.website });
    if (user.socialLinks.linkedin) socialLinks.push({ type: 'linkedin', url: user.socialLinks.linkedin });
    if (user.socialLinks.instagram) socialLinks.push({ type: 'instagram', url: user.socialLinks.instagram });
    if (user.socialLinks.twitter) socialLinks.push({ type: 'twitter', url: user.socialLinks.twitter });
    if (user.socialLinks.youtube) socialLinks.push({ type: 'youtube', url: user.socialLinks.youtube });
    if (user.socialLinks.facebook) socialLinks.push({ type: 'facebook', url: user.socialLinks.facebook });
    if (user.socialLinks.github) socialLinks.push({ type: 'github', url: user.socialLinks.github });
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="h-[90px] flex items-center border-b-[1px] w-full border-[#F5F5F5] bg-white">
        <div className="px-[156px]">
          <img
            src="/logo.png"
            className="w-[235.24px] h-[37.12px]"
            alt="Logo"
          />
        </div>
      </div>

      <div className="px-[156px] w-full mt-[118px] flex flex-col">
        {/* Main Profile Card */}
        <div className="text-[#3A3A3A] border-[#EDEDED] rounded-[18px] w-[400px] border-[0.5px] shadow-[0px_0px_4px_0px_#0000000A] bg-white">
          <div className="flex flex-col gap-[16.69px] pl-[40.4px] pr-[37.46px]">
            <div className="flex">
              <img
                src={user.profilePicture || "/images/profile/default.png"}
                alt="Profile"
                className="w-[120px] h-[120px] mt-[-60px] rounded-full object-cover border-4 border-white shadow-lg"
              />

              <div className="flex items-center ml-[27.4px] justify-between w-full max-w-xs">
                {/* Rating and Review Count */}
                <div className="flex flex-col items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-red-500 text-red-500" />
                    <span className="font-[700] text-[#1D1C22] text-sm">
                      {user.rating?.average?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <span className="underline text-[12px] text-[#1D1C22] cursor-pointer">
                    {user.rating?.count || '0'} review{(user.rating?.count || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Bookmark Icon */}
                <Bookmark className="w-[22px] cursor-pointer h-[22px] text-gray-800 hover:fill-gray-800" />
              </div>
            </div>

            <div className="flex flex-col h-full">
              <h1 className="opacity-100 font-semibold text-[18px]">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-[15px] font-normal mt-[8px] text-[#3A3A3A]">
                {user.title || user.tagline || `${user.role} on Servpe`}
                {user.companyBrand && ` • ${user.companyBrand}`}
                {user.bio && ` | ${user.bio}`}
              </p>
            </div>

            {/* Profile Items Section */}
            {profileItems.length > 0 && (
              <section className="w-[322.12px]">
                <div className="border-t border-dashed border-[#A4A4A4] border-[1px]" />

                <div className="flex justify-between items-center px-[10px] py-[5px]">
                  {profileItems.map((item) => (
                    <div key={item.key} className="flex items-center space-x-1">
                      {/* Gradient circle */}
                      <div
                        className="w-[20px] h-[20px] rounded-full border border-[#A4A4A4] flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #656565 0%, #A4A4A4 100%)",
                        }}
                      >
                        {getProfileIcon(item.type)}
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

                <div className="border-t border-dashed border-[#A4A4A4] border-[1px]" />
              </section>
            )}

            {/* Skills/Expertise Section */}
            <section className="w-[323px]">
              <div className="flex flex-wrap font-medium">
                <div className="flex flex-wrap items-center gap-[4px]">
                  <span className="font-[500] py-1 text-[14px] text-[#3A3A3A]">
                    Expertise
                  </span>
                  {(user.expertise || user.skills || []).slice(0, 6).map((skill: any, idx: number) => (
                    <div
                      key={idx}
                      className="px-2 py-[4px] text-[13px] text-[#000000] rounded-sm"
                      style={{
                        fontWeight: 400,
                        lineHeight: "100%",
                        backgroundColor: "#F8F8F8",
                        border: "0.4px solid #E7E7E7",
                      }}
                    >
                      {typeof skill === 'string' ? skill : skill.name}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Bio Section */}
            <section className="w-[323px] pb-[47.6px]">
              <p className="text-[15px] font-[400] text-black">
                {user.bio ? (
                  user.bio.length > 150 ? (
                    <>
                      {user.bio.substring(0, 150)}...{" "}
                      <span className="text-[#074BEC] cursor-pointer font-[500]">
                        Read more
                      </span>
                    </>
                  ) : (
                    user.bio
                  )
                ) : (
                  `Professional ${user.role} on Servpe platform.`
                )}
              </p>
            </section>
          </div>
        </div>

        {/* Joined Date and Social Links */}
        <div className="border-[0.5px] shadow-[0px_0px_4px_0px_#0000000A] mt-[25px] flex items-center mb-[20px] text-[#3A3A3A] border-[#EDEDED] rounded-[18px] h-[80px] w-[400px] bg-white">
          <section className="flex pl-[40px] items-center w-full">
            {/* Joined On Text */}
            <div className="flex flex-col">
              <span
                className="text-[11px] text-gray-500 uppercase tracking-wider"
                style={{
                  fontWeight: 300,
                  lineHeight: "100%",
                  letterSpacing: "3%",
                }}
              >
                JOINED ON
              </span>
              <span
                className="text-[12px] text-gray-700 font-medium"
                style={{
                  fontWeight: 400,
                  lineHeight: "100%",
                }}
              >
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Social Icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center justify-between ml-[31px] space-x-[12px]">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[25px] cursor-pointer h-[25px] rounded-full flex items-center justify-center border hover:scale-110 transition-transform"
                    style={{
                      background: "linear-gradient(180deg, #656565 0%, #A4A4A4 100%)",
                      borderColor: "#A4A4A4",
                      borderWidth: "0.5px",
                    }}
                  >
                    {getSocialIcon(social.type)}
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Consultation Section - Only for freelancers with hourly rate */}
        {user.hourlyRate && (
          <div className="flex-col border-[0.5px] shadow-[0px_0px_4px_0px_#0000000A] flex items-center pt-[22px] pb-[25px] text-[#3A3A3A] border-[#EDEDED] rounded-[18px] w-[400px] pl-[40px] bg-white">
            <section className="flex flex-col w-fit">
              {/* Top badges row */}
              <div className="flex items-center space-x-[12px]">
                {/* Rating Box */}
                <div className="flex items-center justify-center w-[55px] h-[30px] rounded-[18px] bg-[#F1F1F1] space-x-1">
                  <Star className="w-[15px] h-[15px] fill-[#3E3E3E] text-[#3E3E3E]" />
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
                    lineHeight: "120%",
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
                <Clock className="w-[28px] h-[28px] text-[#ADADAD]" />

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
                  ₹{(user.hourlyRate * 2).toLocaleString()}
                </span>

                {/* ₹1,100 */}
                <span className="text-[16px] text-[#3E3E3E] font-medium">
                  ₹{user.hourlyRate.toLocaleString()}
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
                  className="ml-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileByUsername;
