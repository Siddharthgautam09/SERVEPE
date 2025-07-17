import { useState, useEffect } from "react";
import { Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { categoryAPI } from "@/api/categories";

const ServiceUploadForm = ({ onSubmit, onCancel }: { 
  onSubmit: (serviceData: any) => void; 
  onCancel: () => void; 
}) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [] as string[],
    pricingPlans: {
      basic: {
        title: 'Basic',
        description: '',
        price: 0,
        deliveryTime: 1,
        revisions: 1,
        features: [] as string[]
      }
    }
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value
    });
  };

  const handlePricingChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      pricingPlans: {
        ...formData.pricingPlans,
        basic: {
          ...formData.pricingPlans.basic,
          [field]: value
        }
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

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
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.pricingPlans.basic.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        pricingPlans: {
          ...prev.pricingPlans,
          basic: {
            ...prev.pricingPlans.basic,
            features: [...prev.pricingPlans.basic.features, newFeature.trim()]
          }
        }
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      pricingPlans: {
        ...prev.pricingPlans,
        basic: {
          ...prev.pricingPlans.basic,
          features: prev.pricingPlans.basic.features.filter(f => f !== feature)
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Include selected images in the form data
    const serviceData = {
      ...formData,
      images: selectedImages
    };

    onSubmit(serviceData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Service</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="I will create a stunning website design"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your service in detail..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange} disabled={loadingCategories}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                placeholder="Frontend Development"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="pr-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 p-0 h-4 w-4"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Service Images Upload Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Service Images</Label>
            <p className="text-sm text-gray-600">Upload up to 5 images to showcase your service (Max 5MB each)</p>
            
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
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Basic Package</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basicPrice">Price (₹) *</Label>
                <Input
                  id="basicPrice"
                  type="number"
                  value={formData.pricingPlans.basic.price}
                  onChange={(e) => handlePricingChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time (Days) *</Label>
                <Input
                  id="deliveryTime"
                  type="number"
                  value={formData.pricingPlans.basic.deliveryTime}
                  onChange={(e) => handlePricingChange('deliveryTime', parseInt(e.target.value) || 1)}
                  placeholder="7"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basicDescription">Package Description</Label>
              <Textarea
                id="basicDescription"
                value={formData.pricingPlans.basic.description}
                onChange={(e) => handlePricingChange('description', e.target.value)}
                placeholder="What's included in this package..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Package Features</Label>
              <div className="flex space-x-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.pricingPlans.basic.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="pr-1">
                    {feature}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-0 h-4 w-4"
                      onClick={() => removeFeature(feature)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1">
              Create Service
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceUploadForm;
