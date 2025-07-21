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
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-2xl mx-auto p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Photo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">
            Profile photo
            <span className="text-black ml-1">Required</span>
          </label>
          <div className="flex items-center space-x-4">
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
        </div>

        {/* Servpe Page Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your servpe page link</label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
              servpe.com/
            </span>
            <div className="relative flex-1">
              <Input
                {...register('servpePageLink', { required: 'Servpe page link is required' })}
                className="rounded-l-none border-l-0"
                placeholder="username"
              />
              {linkValidation.isValid && watchedLink && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
          {!linkValidation.isValid && (
            <p className="text-sm text-red-600">{linkValidation.message}</p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your Full Name</label>
          <Input
            {...register('fullName', { required: 'Full name is required' })}
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
        </div>

        {/* WhatsApp Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Whatsapp Number</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
              🇮🇳 +91
            </span>
            <Input
              {...register('whatsappNumber')}
              className="rounded-l-none border-l-0"
              placeholder="8327347078"
            />
          </div>
        </div>

        {/* Email ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email ID</label>
          <Input
            {...register('email', { required: 'Email is required' })}
            type="email"
            placeholder="Enter your email id"
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Designation and Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
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
          <label className="text-sm font-medium text-gray-700">What is your total experience?</label>
          <Input
            {...register('totalExperience')}
            placeholder="E.g. 5+ Years"
          />
        </div>

        {/* Current Organization */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">What is your current organization?</label>
          <Input
            {...register('currentOrganization')}
            placeholder="E.g. Google, Microsoft, etc."
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Where are you based?</label>
          <Input
            {...register('location')}
            placeholder="E.g. Bangalore, Mumbai, New Delhi."
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Skills/Tags</label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {watchedSkills?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Self Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">How would you describe yourself?</label>
          <Textarea
            {...register('selfDescription')}
            placeholder="Write about yourself"
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
          <div className="space-y-3">
            {socialFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
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
              className="flex items-center gap-2 text-blue-600"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
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
