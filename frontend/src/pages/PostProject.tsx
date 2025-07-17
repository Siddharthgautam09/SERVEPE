import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Upload, Tag, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/api/auth';
import { freelancerProjectAPI } from '@/api/freelancerProjects';
import { ApiResponse } from '@/types/api';

const PostProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    skills: [] as string[],
    hashtags: [] as string[],
    budget: {
      type: 'fixed',
      amount: {
        min: 0,
        max: 0
      }
    },
    duration: '',
    experienceLevel: 'intermediate'
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newHashtag, setNewHashtag] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design & Creative',
    'Writing & Translation',
    'Marketing & SEO',
    'Video & Animation',
    'Data Science',
    'Consulting'
  ];

  const subcategories = {
    'Web Development': ['Frontend', 'Backend', 'Full Stack', 'E-commerce', 'WordPress'],
    'Mobile Development': ['iOS', 'Android', 'React Native', 'Flutter', 'Hybrid Apps'],
    'Design & Creative': ['Logo Design', 'UI/UX', 'Graphic Design', 'Branding', 'Illustration'],
    'Writing & Translation': ['Content Writing', 'Copywriting', 'Technical Writing', 'Translation', 'Proofreading'],
    'Marketing & SEO': ['Digital Marketing', 'SEO', 'Social Media', 'PPC', 'Email Marketing'],
    'Video & Animation': ['Video Editing', '2D Animation', '3D Animation', 'Motion Graphics', 'Whiteboard'],
    'Data Science': ['Data Analysis', 'Machine Learning', 'Data Visualization', 'Statistical Analysis', 'Big Data'],
    'Consulting': ['Business Consulting', 'Strategy', 'Project Management', 'Legal Consulting', 'Financial Consulting']
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'budgetMin' || name === 'budgetMax') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          amount: {
            ...prev.budget.amount,
            [name === 'budgetMin' ? 'min' : 'max']: Number(value)
          }
        }
      }));
    } else if (name === 'budgetType') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          type: value
        }
      }));
    } else if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: '' // Reset subcategory when category changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 5 images
      const newImages = [...images, ...files].slice(0, 5);
      setImages(newImages);

      // Create previews
      const newPreviews = [...imagePreviews];
      files.forEach(file => {
        if (newPreviews.length < 5) {
          const reader = new FileReader();
          reader.onload = () => {
            setImagePreviews(prev => [...prev.slice(0, 4), reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !formData.hashtags.includes(newHashtag.trim())) {
      const hashtag = newHashtag.startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtag]
      }));
      setNewHashtag('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = authAPI.getCurrentUser();
    if (!user || user.role !== 'freelancer') {
      toast({
        title: "Access Denied",
        description: "Only freelancers can post projects",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('skills', JSON.stringify(formData.skills));
      formDataToSend.append('hashtags', JSON.stringify(formData.hashtags));
      formDataToSend.append('budget', JSON.stringify(formData.budget));
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('experienceLevel', formData.experienceLevel);

      // Add images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response: ApiResponse = await freelancerProjectAPI.createProject(formDataToSend);
      
      if (response.success) {
        toast({
          title: "Project Posted",
          description: "Your project has been posted successfully!",
        });
        navigate('/freelancer/dashboard');
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/freelancer/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Post New Project</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Share Your Project</CardTitle>
            <CardDescription>
              Showcase your work and attract potential clients with detailed project information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Modern E-commerce Website Built with React"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your project, the challenges you solved, technologies used, and results achieved..."
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory *</Label>
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      disabled={!formData.category}
                    >
                      <option value="">Select subcategory</option>
                      {formData.category && subcategories[formData.category as keyof typeof subcategories]?.map(subcat => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Images Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Images</h3>
                <p className="text-sm text-gray-600">Upload up to 5 images to showcase your project</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload project images
                        </span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Skills & Technologies</h3>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g., React, Node.js, Figma)"
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                  </div>
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="pr-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 p-0 h-4 w-4"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Hashtags</h3>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      placeholder="Add hashtags (e.g., responsive, modern, creative)"
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    />
                  </div>
                  <Button type="button" onClick={addHashtag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.hashtags.map((hashtag) => (
                    <Badge key={hashtag} variant="outline" className="pr-1 text-blue-600 border-blue-200">
                      {hashtag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 p-0 h-4 w-4"
                        onClick={() => removeHashtag(hashtag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Project Duration</Label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select duration</option>
                      <option value="less-than-1-week">Less than 1 week</option>
                      <option value="1-2-weeks">1-2 weeks</option>
                      <option value="2-4-weeks">2-4 weeks</option>
                      <option value="1-3-months">1-3 months</option>
                      <option value="more-than-3-months">More than 3 months</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Complexity Level</Label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="entry">Simple</option>
                      <option value="intermediate">Moderate</option>
                      <option value="expert">Complex</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Budget Range (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budgetType">Budget Type</Label>
                      <select
                        id="budgetType"
                        name="budgetType"
                        value={formData.budget.type}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budgetMin">Min Budget (₹)</Label>
                      <Input
                        id="budgetMin"
                        name="budgetMin"
                        type="number"
                        value={formData.budget.amount.min}
                        onChange={handleInputChange}
                        placeholder="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budgetMax">Max Budget (₹)</Label>
                      <Input
                        id="budgetMax"
                        name="budgetMax"
                        type="number"
                        value={formData.budget.amount.max}
                        onChange={handleInputChange}
                        placeholder="25000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post Project"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/freelancer/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostProject;
