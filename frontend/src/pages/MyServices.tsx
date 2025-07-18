
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, BarChart3, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        {/* <Navbar /> */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      {/* <Navbar /> */}
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-14 shadow-md rounded-b-3xl mb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-white mr-2" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">My Services</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-2xl">Manage your service offerings and track your performance</p>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Your Services</h2>
            <p className="text-gray-600 mt-1">Create, edit, and manage your services</p>
          </div>
          <Button onClick={() => navigate('/create-service')} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 rounded-lg shadow">
            <Plus className="h-4 w-4 mr-2" />
            Create New Service
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {['all', 'active', 'paused', 'pending'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status as any)}
              className={`capitalize rounded-full px-6 ${filter === status ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : ''}`}
            >
              {status}
            </Button>
          ))}
        </div>

        {services.length === 0 ? (
          <Card className="rounded-2xl shadow-md">
            <CardContent className="text-center py-16">
              <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">Create your first service to start earning</p>
              <Button onClick={() => navigate('/create-service')} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any) => (
              <Card key={service._id} className="hover:shadow-2xl transition-shadow border-0 rounded-2xl overflow-hidden group bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getStatusColor(service.status) + ' rounded-full px-4 py-1 text-xs font-semibold'}>
                      {service.status}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="hover:bg-purple-50">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-purple-50">
                        <Edit className="h-5 w-5 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-purple-50">
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-base text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Starting Price:</span>
                      <span className="font-semibold text-purple-700">₹{service.pricingPlans?.basic?.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Orders:</span>
                      <span>{service.orders || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-semibold text-yellow-500">{service.averageRating || 0}/5</span>
                      <span className="text-gray-400">({service.totalReviews || 0})</span>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-full shadow"
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
