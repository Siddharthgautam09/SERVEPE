
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Eye, CheckCircle, X, Star, Edit, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const Services = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [adminToken, setAdminToken] = useState('');
  const [editingService, setEditingService] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get admin token on component mount
  useEffect(() => {
    const getAdminToken = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
          }),
        });
        
        const data = await response.json();
        if (data.success && data.token) {
          setAdminToken(data.token);
          localStorage.setItem('admin_token', data.token);
        }
      } catch (error) {
        console.error('Failed to get admin token:', error);
      }
    };

    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setAdminToken(storedToken);
    } else {
      getAdminToken();
    }
  }, []);

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['admin-services', search, activeTab],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8080/api/services?search=${search}&status=${activeTab === 'all' ? '' : activeTab}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      return response.json();
    },
    enabled: !!adminToken
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, ...serviceData }: any) => {
      const response = await fetch(`http://localhost:8080/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(serviceData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setEditingService(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:8080/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    }
  });

  const approveServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:8080/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'active' }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({
        title: "Success",
        description: "Service approved successfully",
      });
    }
  });

  const rejectServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:8080/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({
        title: "Success",
        description: "Service rejected successfully",
      });
    }
  });

  const services = servicesData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEditService = (service: any) => {
    setEditingService({
      ...service,
      basicPrice: service.pricingPlans?.basic?.price || 0,
      standardPrice: service.pricingPlans?.standard?.price || 0,
      premiumPrice: service.pricingPlans?.premium?.price || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      const updateData = {
        title: editingService.title,
        description: editingService.description,
        category: editingService.category,
        subcategory: editingService.subcategory,
        status: editingService.status,
        pricingPlans: {
          basic: {
            ...editingService.pricingPlans?.basic,
            price: editingService.basicPrice
          },
          ...(editingService.standardPrice && {
            standard: {
              ...editingService.pricingPlans?.standard,
              price: editingService.standardPrice
            }
          }),
          ...(editingService.premiumPrice && {
            premium: {
              ...editingService.pricingPlans?.premium,
              price: editingService.premiumPrice
            }
          })
        }
      };
      updateServiceMutation.mutate({ id: editingService._id, ...updateData });
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  if (isLoading || !adminToken) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600 mt-2">Manage and moderate freelancer services</p>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Services ({services.length})</CardTitle>
                <CardDescription>
                  Review and manage all services on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {services.map((service: any) => (
                    <div
                      key={service._id}
                      className="border rounded-lg p-6 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {service.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 mb-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={service.freelancer?.profilePicture} />
                              <AvatarFallback>
                                {service.freelancer?.firstName?.[0]}
                                {service.freelancer?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {service.freelancer?.firstName} {service.freelancer?.lastName}
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-600 ml-1">
                                    {service.averageRating || 0}/5
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600">
                                  {service.orders || 0} orders
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                            <Badge variant="outline">
                              {service.category}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Created {new Date(service.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-6">
                          <div className="mb-2">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(service.pricingPlans?.basic?.price || 0)}
                            </p>
                            <p className="text-sm text-gray-600">Basic Plan</p>
                          </div>
                          
                          {service.pricingPlans?.standard && (
                            <div className="mb-2">
                              <p className="text-lg font-semibold text-blue-600">
                                {formatCurrency(service.pricingPlans.standard.price || 0)}
                              </p>
                              <p className="text-xs text-gray-600">Standard Plan</p>
                            </div>
                          )}
                          
                          {service.pricingPlans?.premium && (
                            <div className="mb-4">
                              <p className="text-lg font-semibold text-purple-600">
                                {formatCurrency(service.pricingPlans.premium.price || 0)}
                              </p>
                              <p className="text-xs text-gray-600">Premium Plan</p>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-4">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteService(service._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            
                            {service.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => approveServiceMutation.mutate(service._id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => rejectServiceMutation.mutate(service._id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Service Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update service information and pricing
              </DialogDescription>
            </DialogHeader>
            {editingService && (
              <form onSubmit={handleUpdateService} className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Service Title</Label>
                  <Input
                    id="edit-title"
                    value={editingService.title}
                    onChange={(e) => setEditingService(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter service title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingService.description}
                    onChange={(e) => setEditingService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter service description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={editingService.category}
                      onChange={(e) => setEditingService(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Enter category"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-subcategory">Subcategory</Label>
                    <Input
                      id="edit-subcategory"
                      value={editingService.subcategory || ''}
                      onChange={(e) => setEditingService(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="Enter subcategory"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="basic-price">Basic Price (₹)</Label>
                    <Input
                      id="basic-price"
                      type="number"
                      value={editingService.basicPrice}
                      onChange={(e) => setEditingService(prev => ({ ...prev, basicPrice: Number(e.target.value) }))}
                      placeholder="Basic price"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="standard-price">Standard Price (₹)</Label>
                    <Input
                      id="standard-price"
                      type="number"
                      value={editingService.standardPrice}
                      onChange={(e) => setEditingService(prev => ({ ...prev, standardPrice: Number(e.target.value) }))}
                      placeholder="Standard price"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="premium-price">Premium Price (₹)</Label>
                    <Input
                      id="premium-price"
                      type="number"
                      value={editingService.premiumPrice}
                      onChange={(e) => setEditingService(prev => ({ ...prev, premiumPrice: Number(e.target.value) }))}
                      placeholder="Premium price"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateServiceMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateServiceMutation.isPending ? 'Updating...' : 'Update Service'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Services;
