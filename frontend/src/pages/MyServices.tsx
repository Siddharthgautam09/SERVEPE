
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { serviceAPI } from '@/api/services';
import Navbar from '@/components/Navbar';

const MyServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'pending'>('all');

  const { data: servicesData, isLoading, refetch } = useQuery({
    queryKey: ['my-services', filter],
    queryFn: () => serviceAPI.getMyServices({ status: filter === 'all' ? undefined : filter }),
  });

  const services = servicesData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
            <p className="text-gray-600 mt-2">Manage your service offerings</p>
          </div>
          <Button onClick={() => navigate('/create-service')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Service
          </Button>
        </div>

        <div className="flex space-x-4 mb-6">
          {['all', 'active', 'paused', 'pending'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">Create your first service to start earning</p>
              <Button onClick={() => navigate('/create-service')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <Card key={service._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Starting Price:</span>
                      <span className="font-semibold">₹{service.pricingPlans?.basic?.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Orders:</span>
                      <span>{service.orders || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <span>{service.averageRating || 0}/5 ({service.totalReviews || 0})</span>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => navigate(`/services/${service._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServices;
