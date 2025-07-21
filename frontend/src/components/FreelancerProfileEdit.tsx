import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Camera, Plus, X, Check, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/api/users';
import { useNavigate } from 'react-router-dom';

interface ProfileFormData {
  profilePicture?: string;
  servpePageLink: string;
  fullName: string;
  whatsappNumber: string;
  email: string;
  designation: string;
  totalExperience: string;
  currentOrganization: string;
  location: string;
  skills: string[];
  selfDescription: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
}

const socialPlatforms = [
  'LinkedIn',
  'Twitter',
  'Facebook',
  'Instagram',
  'GitHub',
  'Website',
  'YouTube',
  'Behance',
  'Dribbble'
];

const FreelancerProfileEdit = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [linkValidation, setLinkValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });
  const [newSkill, setNewSkill] = useState('');

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      servpePageLink: user?.username || '',
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      whatsappNumber: user?.whatsappNumber || '',
      email: user?.email || '',
      designation: user?.title || '',
      totalExperience: user?.totalExperienceYears?.toString() || '',
      currentOrganization: user?.companyBrand || '',
      location: typeof user?.location === 'string' ? user.location : user?.location?.city || '',
      skills: user?.skills?.map(skill => typeof skill === 'string' ? skill : skill.name) || [],
      selfDescription: user?.bio || '',
      socialLinks: [
        { platform: 'LinkedIn', url: user?.socialLinks?.linkedin || '' },
        { platform: 'Website', url: user?.socialLinks?.website || '' }
      ]
    }
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control,
    name: 'socialLinks'
  });

  const watchedLink = watch('servpePageLink');
  const watchedSkills = watch('skills');

  useEffect(() => {
    if (user?.profilePicture) {
      setProfileImage(user.profilePicture);
    }
  }, [user]);

  useEffect(() => {
    if (watchedLink) {
      // Simple validation for username format
      const isValid = /^[a-zA-Z0-9_-]+$/.test(watchedLink) && watchedLink.length >= 3;
      setLinkValidation({
        isValid,
        message: isValid ? '' : 'Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores'
      });
    }
  }, [watchedLink]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !watchedSkills.includes(newSkill.trim())) {
      const currentSkills = watchedSkills || [];
      setValue('skills', [...currentSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = watchedSkills || [];
    setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const addSocialLink = () => {
    appendSocial({ platform: 'LinkedIn', url: '' });
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!linkValidation.isValid) {
      toast({
        title: "Error",
        description: "Please fix the Servpe page link before saving",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const [firstName, ...lastNameParts] = data.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      // Convert social links to the expected format
      const socialLinksObject = data.socialLinks.reduce((acc, link) => {
        if (link.url.trim()) {
          acc[link.platform.toLowerCase()] = link.url.trim();
        }
        return acc;
      }, {} as any);

      const profileData = {
        firstName: firstName || '',
        lastName: lastName || '',
        username: data.servpePageLink,
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        title: data.designation,
        bio: data.selfDescription,
        totalExperienceYears: parseInt(data.totalExperience) || 0,
        companyBrand: data.currentOrganization,
        location: data.location,
        skills: data.skills.map(skill => ({ name: skill, level: 'intermediate' })),
        socialLinks: socialLinksObject
      };

      const response = await userAPI.updateProfile(profileData);
      if (response.success) {
        updateUser(response.data);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-start py-8 pl-8">
      <div className="w-full max-w-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo */}
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="ml-4 flex flex-col">
                <label className="text-l font-bold text-black">Profile photo</label>
                <span className="text-sm font-medium text-black mt-1">Required</span>
              </div>
            </div>
          </div>

          {/* Servpe Page Link - Improved Version */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Your servpe page link</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
              {/* Left partition - prefix */}
              <div className="bg-gray-50 border-r border-gray-300 px-3 py-2 text-gray-500 text-sm h-10 flex items-center">
                servpe.com/
              </div>
              
              {/* Right partition - input area */}
              <div className="relative flex-1 flex items-center">
                <input
                  {...register('servpePageLink', { required: 'Servpe page link is required' })}
                  className="w-full px-3 py-2 h-10 border-0 focus:outline-none focus:ring-0 text-gray-900"
                  placeholder="username"
                />
                {linkValidation.isValid && watchedLink && (
                  <div className="absolute right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            {!linkValidation.isValid && watchedLink && (
              <p className="text-sm text-red-600">{linkValidation.message}</p>
            )}
            {errors.servpePageLink && (
              <p className="text-sm text-red-600">{errors.servpePageLink.message}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Your Full Name</label>
            <Input
              {...register('fullName', { required: 'Full name is required' })}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
          </div>

          {/* WhatsApp Number - Improved Version */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Whatsapp Number</label>
            <div className="flex rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white">
              <span className="inline-flex items-center px-4 py-3 bg-white text-gray-900 text-sm border-r border-gray-200">
                IN +91
              </span>
              <input
                {...register('whatsappNumber')}
                type="tel"
                className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                placeholder="8327347078"
              />
            </div>
          </div>

          {/* Email ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Email ID</label>
            <Input
              {...register('email', { required: 'Email is required' })}
              type="email"
              placeholder="Enter your email id"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Designation and Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              Your Designation and Bio
              <span className="text-gray-400 ml-2">Max. 100 chars</span>
            </label>
            <Textarea
              {...register('designation')}
              placeholder="E.g. I am a Android developer with 5+ years of experience in android development with java and kotlin language, and build 20+ projects with various kind of..."
              maxLength={100}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Total Experience */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">What is your total experience?</label>
            <Input
              {...register('totalExperience')}
              placeholder="E.g. 5+ Years"
            />
          </div>

          {/* Current Organization */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">What is your current organization?</label>
            <Input
              {...register('currentOrganization')}
              placeholder="E.g. Google, Microsoft, etc."
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Where are you based?</label>
            <Input
              {...register('location')}
              placeholder="E.g. Bangalore, Mumbai, New Delhi."
            />
          </div>

          {/* Self Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">How would you describe yourself?</label>
            <Textarea
              {...register('selfDescription')}
              placeholder="Write about yourself"
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Social Links</h3>
            <div className="space-y-3">
              {socialFields.map((field, index) => (
                <div key={field.id} className="flex gap-0.5 items-center">
                  <Select
                    value={watch(`socialLinks.${index}.platform`)}
                    onValueChange={(value) => setValue(`socialLinks.${index}.platform`, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {socialPlatforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    {...register(`socialLinks.${index}.url`)}
                    placeholder="https://www.linkedin.com/in/username"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSocial(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
  type="button"
  variant="ghost"
  onClick={addSocialLink}
  className="w-full flex items-center justify-center gap-2 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg py-5
    hover:border-gray-400 hover:text-gray-600 transition-colors 
    hover:bg-transparent focus:bg-transparent active:bg-transparent"
>
  <Plus className="h-4 w-4" />
  Add social link
</Button>

            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreelancerProfileEdit;
