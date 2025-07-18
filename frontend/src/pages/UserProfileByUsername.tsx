
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

  // Choose skills if present, otherwise expertise
  const skillsToShow = (user.skills && user.skills.length > 0) ? user.skills : (user.expertise || []);

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
        <div className="flex flex-col items-center w-full mt-[40px]">
          <div className="bg-white rounded-[18px] border border-[#EDEDED] shadow-[0px_0px_4px_0px_#0000000A] w-full max-w-[400px] p-0 flex flex-col items-center relative">
            {/* Profile Image */}
            <div className="flex flex-col items-center w-full pt-[-60px]">
              <img
                src={user.profilePicture || "/images/profile/default.png"}
                alt="Profile"
                className="w-[120px] h-[120px] rounded-full object-cover border-4 border-white shadow-lg -mt-14"
              />
            </div>
            {/* Rating and Bookmark */}
            <div className="flex items-center justify-between w-full px-8 mt-2">
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-red-500 text-red-500" />
                  <span className="font-bold text-[#1D1C22] text-sm">{user.rating?.average?.toFixed(1) || '0.0'}</span>
                </div>
                <span className="underline text-[12px] text-[#1D1C22] cursor-pointer">{user.rating?.count || '0'} review{(user.rating?.count || 0) !== 1 ? 's' : ''}</span>
              </div>
              <Bookmark className="w-[22px] h-[22px] text-gray-800 cursor-pointer hover:fill-gray-800" />
            </div>
            {/* Name and Title */}
            <div className="flex flex-col items-center w-full px-8 mt-2">
              <h1 className="font-semibold text-[18px] text-center">{user.firstName} {user.lastName}</h1>
              <p className="text-[15px] font-normal mt-1 text-[#3A3A3A] text-center">
                {user.title || user.tagline || `${user.role} on Servpe`}
              </p>
              {/* Username/Servpe Page Link */}
              {user.username && (
                <span className="text-[13px] text-blue-600 mt-1">servpe.com/{user.username}</span>
              )}
            </div>
            {/* Profile Items: Experience, Company, Location */}
            <div className="flex justify-center items-center gap-4 w-full mt-3">
              {user.totalExperienceYears && (
                <div className="flex items-center gap-1 text-[12px] text-[#3A3A3A]">
                  <Clock className="w-4 h-4 text-[#A4A4A4]" />
                  {user.totalExperienceYears}+ Years
                </div>
              )}
              {user.companyBrand && (
                <div className="flex items-center gap-1 text-[12px] text-[#3A3A3A]">
                  <div className="w-4 h-4 bg-[#A4A4A4] rounded-sm flex items-center justify-center text-white text-[10px] font-bold">S</div>
                  {user.companyBrand}
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1 text-[12px] text-[#3A3A3A]">
                  <MapPin className="w-4 h-4 text-[#A4A4A4]" />
                  {typeof user.location === 'string' ? user.location : `${user.location?.city || ''}${user.location?.city && user.location?.country ? ', ' : ''}${user.location?.country || ''}`}
                </div>
              )}
            </div>
            {/* Skills/Tags */}
            <div className="flex flex-wrap items-center gap-2 justify-center w-full mt-3 px-8">
              {skillsToShow.slice(0, 12).map((skill: any, idx: number) => (
                <div
                  key={idx}
                  className="px-2 py-1 text-[13px] text-[#000000] rounded-sm bg-[#F8F8F8] border border-[#E7E7E7]"
                  style={{ fontWeight: 400, lineHeight: '100%' }}
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </div>
              ))}
            </div>
            {/* Bio Section */}
            <div className="w-full px-8 mt-3 mb-4">
              <h2 className="text-[14px] font-semibold text-gray-700 mb-1">About</h2>
              <p className="text-[15px] font-normal text-black text-left">
                {user.bio ? (
                  user.bio.length > 150 ? (
                    <>
                      {user.bio.substring(0, 150)}... <span className="text-[#074BEC] cursor-pointer font-medium">Read more</span>
                    </>
                  ) : (
                    user.bio
                  )
                ) : (
                  `Professional ${user.role} on Servpe platform.`
                )}
              </p>
            </div>
            {/* Contact Section */}
            <div className="w-full px-8 mb-4">
              <h2 className="text-[14px] font-semibold text-gray-700 mb-1">Contact</h2>
              <div className="flex flex-col gap-1 text-[13px] text-gray-800">
                {user.email && <span><b>Email:</b> {user.email}</span>}
                {user.whatsappNumber && <span><b>WhatsApp:</b> {user.whatsappNumber}</span>}
              </div>
            </div>
            {/* Social Links Section (all) */}
            <div className="w-full px-8 mb-4">
              <h2 className="text-[14px] font-semibold text-gray-700 mb-1">Social Links</h2>
              <div className="flex flex-wrap gap-2">
                {user.socialLinks && Object.entries(user.socialLinks).map(([platform, url]: [string, string]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[25px] h-[25px] rounded-full flex items-center justify-center border border-[#A4A4A4] bg-gradient-to-b from-[#656565] to-[#A4A4A4] hover:scale-110 transition-transform"
                      title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    >
                      {getSocialIcon(platform)}
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
          {/* Joined Date */}
          <div className="bg-white rounded-[18px] border border-[#EDEDED] shadow-[0px_0px_4px_0px_#0000000A] w-full max-w-[400px] mt-6 flex items-center h-[80px] px-8">
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">JOINED ON</span>
              <span className="text-[12px] text-gray-700 font-medium">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          {/* Consultation Section */}
          {user.hourlyRate && (
            <div className="bg-white rounded-[18px] border border-[#EDEDED] shadow-[0px_0px_4px_0px_#0000000A] w-full max-w-[400px] mt-6 flex flex-col items-center pt-6 pb-6 px-8">
              <div className="flex items-center w-full mb-4">
                <div className="flex items-center justify-center w-[55px] h-[30px] rounded-[18px] bg-[#F1F1F1] space-x-1">
                  <Star className="w-[15px] h-[15px] fill-[#3E3E3E] text-[#3E3E3E]" />
                  <span className="text-[14px] font-bold text-[#3E3E3E]">{user.rating?.average?.toFixed(1) || '4.8'}</span>
                </div>
                <div className="w-[81.38px] h-[30px] rounded-[18px] bg-[#E4EFFF] flex items-center justify-center ml-3">
                  <span className="text-[14px] font-medium text-[#074BEC]">Popular</span>
                </div>
              </div>
              <div className="w-full">
                <p className="text-[21px] font-semibold text-[#3E3E3E] leading-[120%]">Need help? want to talk with me book the consultation call now</p>
                <p className="text-[16px] font-normal text-[#696D75] mt-3 leading-[100%]">Not sure about the quality?</p>
              </div>
              <div className="flex items-center w-full mt-6 justify-between bg-[#F1F1F1] rounded-[15px] px-4 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-[28px] h-[28px] text-[#ADADAD]" />
                  <div className="flex flex-col">
                    <span className="font-medium text-[16px] text-[#3E3E3E] leading-none">30 mins</span>
                    <span className="text-[11px] mt-[1px] font-normal text-[#565656] leading-none">Video Meeting</span>
                  </div>
                </div>
                <button className="flex items-center justify-center w-[135px] h-[36px] border border-[#3E3E3E] rounded-[54.23px] bg-[#F1F1F1] cursor-pointer hover:bg-[#E4E4E4] transition-colors duration-200 ease-in-out">
                  <span className="text-[13px] mr-2 text-[#696D75] line-through">₹{(user.hourlyRate * 2).toLocaleString()}</span>
                  <span className="text-[16px] text-[#3E3E3E] font-medium">₹{user.hourlyRate.toLocaleString()}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E3E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileByUsername;
