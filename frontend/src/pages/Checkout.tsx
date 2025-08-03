import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { orderAPI } from '@/api/orders';
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUpload {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { service, selectedPlan } = location.state || {};

  // Form state
  const [requirements, setRequirements] = useState('');
  const [overview, setOverview] = useState('');
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [coupon, setCoupon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate pricing
  const planPrice = service?.pricingPlans?.[selectedPlan]?.price || 0;
  const itemTotal = planPrice;
  const itemDiscount = Math.round(planPrice * 0.5); // 50% discount for demo
  const taxes = Math.round((itemTotal - itemDiscount) * 0.18); // 18% GST
  const serviceCharge = Math.round((itemTotal - itemDiscount) * 0.05); // 5% service charge
  const couponDiscount = coupon ? Math.round((itemTotal - itemDiscount) * 0.1) : 0; // 10% coupon
  const total = itemTotal - itemDiscount + taxes + serviceCharge - couponDiscount;

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      // Check file size (2GB limit)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 2GB limit`,
          variant: "destructive",
        });
        return;
      }

      const fileUpload: FileUpload = {
        file,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'uploading'
      };

      setFiles(prev => [...prev, fileUpload]);
    });
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'zip':
      case 'rar': return '📦';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📎';
    }
  };

  const handleSubmit = async () => {
    if (!service || !selectedPlan) {
      toast({
        title: "Error",
        description: "Service information is missing",
        variant: "destructive",
      });
      return;
    }

    if (!requirements.trim()) {
      toast({
        title: "Requirements required",
        description: "Please provide project requirements",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        serviceId: service._id,
        selectedPlan,
        requirements: `${requirements}\n\nProject Overview:\n${overview}`,
        addOns: []
      };

      const fileList = files.map(f => f.file);
      
      const response = await orderAPI.createOrder(orderData, fileList);
      
      if (response.success) {
        toast({
          title: "Order created successfully!",
          description: `Order #${response.data.orderNumber} has been placed`,
        });
        
        // Navigate to order details or dashboard
        navigate(`/client/orders`);
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Error creating order",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service || !selectedPlan) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Checkout</h2>
            <p className="text-gray-600 mb-4">Service information is missing. Please go back and try again.</p>
            <Button onClick={() => navigate('/services')}>
              Browse Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <header className="bg-white py-4 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo-2.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl text-gray-800">SERVPE</span>
          </div>
          <div className="flex-1 flex items-center max-w-lg mx-auto">
            <input type="text" placeholder="Search for services..." className="rounded-lg border border-gray-300 px-4 py-2 w-full" />
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Hi, {user.firstName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
        {/* Left: Requirements Form */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Submit Your Requirements</h2>
          
          {/* Service Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={service.images?.[0]?.url || '/images/logo-2.png'} 
                  alt={service.title} 
                  className="w-16 h-16 rounded-lg object-cover" 
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{service.title}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements Form */}
          <div className="space-y-6">
            <div>
              <label className="font-semibold text-sm mb-2 block">What do you need?</label>
              <Textarea
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[80px]"
                placeholder="Project overview and any external link or file links"
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-semibold text-sm mb-2 block">Project Requirement Overview</label>
              <Textarea
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[80px]"
                placeholder="Submit your requirements & explain properly to match your expectation"
                value={overview}
                onChange={e => setOverview(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="font-semibold text-sm mb-2 block">Upload Files (Optional)</label>
              <div 
                className="bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-8 mb-4 cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <div className="font-semibold text-gray-700 mb-1">Upload your files here</div>
                <div className="text-xs text-gray-400">Max file size 2GB • Supports all file types</div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-3">
                  {files.map((fileUpload) => (
                    <div key={fileUpload.id} className="flex items-center bg-white rounded-lg px-4 py-3 shadow border border-gray-100">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-lg">{getFileIcon(fileUpload.file.name)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {fileUpload.file.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatFileSize(fileUpload.file.size)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {fileUpload.status === 'uploading' && (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-xs text-gray-500">Ready</span>
                          </div>
                        )}
                        {fileUpload.status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {fileUpload.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <button 
                          onClick={() => removeFile(fileUpload.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Checkout Summary */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Checkout Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Details */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={service.images?.[0]?.url || '/images/logo-2.png'} 
                  alt={service.title} 
                  className="w-16 h-16 rounded-lg object-cover" 
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm line-clamp-2">
                    {service.title}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                />
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2">
                <div className="font-semibold text-sm">Payment Summary</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Item total</span>
                    <span>₹{itemTotal}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Item Discount</span>
                    <span>-₹{itemDiscount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes GST</span>
                    <span>₹{taxes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service charge</span>
                    <span>₹{serviceCharge}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 text-green-700 text-xs rounded-lg px-3 py-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>You have saved ₹{itemDiscount} on final bill</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                onClick={handleSubmit}
                disabled={isSubmitting || !requirements.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;