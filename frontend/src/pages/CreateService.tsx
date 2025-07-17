import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { serviceAPI } from "@/api/services";
import { categoryAPI } from "@/api/categories";
import { useToast } from "@/hooks/use-toast";

const CreateService = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
    pricingPlans: {
      basic: {
        title: 'Basic',
        description: '',
        price: '',
        deliveryTime: '',
        revisions: '1',
        features: []
      },
      standard: {
        title: 'Standard',
        description: '',
        price: '',
        deliveryTime: '',
        revisions: '2',
        features: []
      },
      premium: {
        title: 'Premium',
        description: '',
        price: '',
        deliveryTime: '',
        revisions: '3',
        features: []
      }
    }
  });

  const [currentTag, setCurrentTag] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryAPI.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePricingPlanChange = (plan, field, value) => {
    setFormData(prev => ({
      ...prev,
      pricingPlans: {
        ...prev.pricingPlans,
        [plan]: {
          ...prev.pricingPlans[plan],
          [field]: value
        }
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList) as File[];
    
    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validImageTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Please select only image files (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Check file sizes (5MB limit each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Each image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Limit to 5 images total
    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive",
      });
      return;
    }

    // Add new images to existing ones
    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create previews for new files
    const newPreviews = [...imagePreviews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          newPreviews.push(reader.result as string);
          setImagePreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addFeature = (plan) => {
    const feature = prompt('Enter feature:');
    if (feature) {
      handlePricingPlanChange(plan, 'features', [
        ...formData.pricingPlans[plan].features,
        feature
      ]);
    }
  };

  const removeFeature = (plan, index) => {
    const newFeatures = formData.pricingPlans[plan].features.filter((_, i) => i !== index);
    handlePricingPlanChange(plan, 'features', newFeatures);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare service data for backend
      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags,
        images: selectedImages, // Include selected images
        pricingPlans: {
          basic: {
            ...formData.pricingPlans.basic,
            price: Number(formData.pricingPlans.basic.price),
            deliveryTime: Number(formData.pricingPlans.basic.deliveryTime),
            revisions: Number(formData.pricingPlans.basic.revisions)
          },
          standard: formData.pricingPlans.standard.price ? {
            ...formData.pricingPlans.standard,
            price: Number(formData.pricingPlans.standard.price),
            deliveryTime: Number(formData.pricingPlans.standard.deliveryTime),
            revisions: Number(formData.pricingPlans.standard.revisions)
          } : undefined,
          premium: formData.pricingPlans.premium.price ? {
            ...formData.pricingPlans.premium,
            price: Number(formData.pricingPlans.premium.price),
            deliveryTime: Number(formData.pricingPlans.premium.deliveryTime),
            revisions: Number(formData.pricingPlans.premium.revisions)
          } : undefined
        }
      };

      const response = await serviceAPI.createService(serviceData);
      
      if (response.success) {
        toast({
          title: "Success!",
          description: "Service created successfully",
        });
        navigate('/dashboard/freelancer');
      } else {
        throw new Error(response.message || 'Failed to create service');
      }
    } catch (error) {
      console.error('Create service error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/freelancer')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Service</h1>
          <p className="text-gray-600">Showcase your skills and start earning by creating an amazing service listing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the main details about your service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  placeholder="I will create a professional logo design..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you'll deliver, your experience, and why clients should choose you..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)} disabled={loadingCategories}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    placeholder="e.g., Logo Design"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Images Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Service Images</CardTitle>
              <CardDescription>Upload up to 5 images to showcase your service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="service-images"
                />
                <label htmlFor="service-images" className="cursor-pointer">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Upload Service Images</p>
                    <p className="text-sm text-gray-600">
                      Click to select multiple images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPEG, PNG, GIF, WebP (Max 5MB each)
                    </p>
                  </div>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selected Images ({selectedImages.length}/5)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Service image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          {Math.round(selectedImages[index]?.size / 1024)} KB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Plans</CardTitle>
              <CardDescription>Create different packages for your service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {['basic', 'standard', 'premium'].map((plan) => (
                  <div key={plan} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg capitalize mb-4">{plan}</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Package Description</Label>
                        <Textarea
                          placeholder="Describe what's included"
                          rows={3}
                          value={formData.pricingPlans[plan].description}
                          onChange={(e) => handlePricingPlanChange(plan, 'description', e.target.value)}
                          required={plan === 'basic'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            placeholder="2500"
                            value={formData.pricingPlans[plan].price}
                            onChange={(e) => handlePricingPlanChange(plan, 'price', e.target.value)}
                            required={plan === 'basic'}
                          />
                        </div>
                        <div>
                          <Label>Delivery (days)</Label>
                          <Input
                            type="number"
                            placeholder="3"
                            value={formData.pricingPlans[plan].deliveryTime}
                            onChange={(e) => handlePricingPlanChange(plan, 'deliveryTime', e.target.value)}
                            required={plan === 'basic'}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Revisions</Label>
                        <Input
                          type="number"
                          placeholder="2"
                          value={formData.pricingPlans[plan].revisions}
                          onChange={(e) => handlePricingPlanChange(plan, 'revisions', e.target.value)}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Features</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addFeature(plan)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {formData.pricingPlans[plan].features.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded">
                              <span>{feature}</span>
                              <X 
                                className="h-3 w-3 cursor-pointer text-gray-500" 
                                onClick={() => removeFeature(plan, index)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/freelancer')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateService;
