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
    const props = { className: "text-white", size: 14 };
    
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

  // Choose skills if present, otherwise expertise
  const skillsToShow = (user.skills && user.skills.length > 0) ? user.skills : (user.expertise || []);

  return (
    <div className="w-full flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="h-[90px] flex items-center border-b-[1px] w-full border-[#F5F5F5] bg-white">
        <div className="px-[156px]">
          <button 
            onClick={() => navigate('/freelancer/dashboard')}
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
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="text-lg font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex justify-center w-full py-8">
        <div className="w-[320px] space-y-4">
          
          {/* Main Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Profile Image and Basic Info - Realigned with bookmark on right */}
            <div className="flex items-start mb-4 relative w-full">
              {/* Left side - Profile Image */}
              <div className="relative -mt-14">
                <img
                  src={user.profilePicture || "/images/profile/default.png"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>

              {/* Right side - Rating and Reviews */}
              <div className="ml-4 flex flex-col">
                {/* Rating */}
                <div className="flex items-center mb-1">
                  <Star className="w-4 h-4 fill-red-500 text-red-500 mr-1" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {user.rating?.average?.toFixed(1) || '4.8'}
                  </span>
                </div>
                <span className="text-xs text-gray-600 underline cursor-pointer">
                  {user.rating?.count || '1k'} reviews
                </span>
              </div>

              {/* Bookmark Icon - Moved to right side of card */}
              <div className="absolute right-0 top-0">
                <Bookmark className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
            </div>

            {/* Name and Title */}
            <div className="text-center mb-4">
              <h1 className="font-semibold text-lg text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-gray-600 leading-tight">
                {user.title || user.bio?.substring(0, 80) + '...' || `${user.role} on Servpe`}
              </p>
            </div>

            {/* Profile Items */}
            <div className="flex justify-center gap-4 mb-6">
              {user.totalExperienceYears && (
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                    <Clock className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">{user.totalExperienceYears}+ Years</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-xs text-gray-600">Servpe</span>
              </div>
              
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-2 h-2 text-white fill-white" />
                </div>
                <span className="text-xs text-gray-600">Malda</span>
              </div>
            </div>

            {/* Expertise Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Expertise</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  Video Editing
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  Programming
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  Graphic Design
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  Logo Designing
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  Logo Designing
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  Branding
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                {user.bio ? (
                  user.bio.length > 120 ? (
                    <>
                      {user.bio.substring(0, 120)}... <span className="text-blue-600 cursor-pointer">Read more</span>
                    </>
                  ) : (
                    user.bio
                  )
                ) : (
                  <>
                    founder of Servpe, a modern freelance platform for India's startups, creators, and MSMEs. 
                    On a mission to empower people... <span className="text-blue-600 cursor-pointer">Read more</span>
                  </>
                )}
              </p>
            </div>

            {/* Join Date */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">JOINED ON</div>
              <div className="text-sm text-gray-700 font-medium">Sept, 2025</div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {user.socialLinks && Object.entries(user.socialLinks).slice(0, 6).map(([platform, url]: [string, string]) => (
                url && (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                  >
                    {getSocialIcon(platform)}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Rating and Popular Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
              <Star className="w-4 h-4 fill-gray-600 text-gray-600 mr-1" />
              <span className="text-sm font-semibold text-gray-800">4.8</span>
            </div>
            <div className="bg-blue-100 text-blue-600 rounded-full px-3 py-1">
              <span className="text-sm font-medium">Popular</span>
            </div>
          </div>

          {/* Consultation Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
              Need help? want to talk with me book the consultation call now
            </h2>
            <p className="text-gray-500 text-sm mb-6">Not sure about the quality?</p>
            
            <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">30 mins</div>
                  <div className="text-xs text-gray-500">Video Meeting</div>
                </div>
              </div>
              
              <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2">
                <span className="text-gray-400 line-through text-sm mr-2">
                  ₹2,200
                </span>
                <span className="font-semibold text-gray-900 mr-1">
                  ₹1,100
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfileByUsername;
