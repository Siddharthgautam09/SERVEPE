import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';
import { serviceAPI } from '@/api/services';
import { categoryAPI } from '@/api/categories';
import Navbar from '@/components/Navbar';
import { Service } from '@/types/service';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, priceRange, deliveryTime, sortBy, searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryAPI.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (priceRange && priceRange !== 'all') {
        params.append('priceRange', priceRange);
      }
      if (deliveryTime && deliveryTime !== 'all') {
        params.append('deliveryTime', deliveryTime);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sort', sortBy);

      const response = await serviceAPI.getAllServices(Object.fromEntries(params));
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Section */}
      <header className="bg-gradient-to-r from-purple-50 to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Services</h1>
          <p className="text-gray-600 text-lg">Find the perfect service for your needs</p>
        </div>
      </header>

      {/* Search and Filters Section */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex items-center mb-6">
            <div className="flex rounded-md shadow-sm w-full">
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              />
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-r-md">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-4">
            <Select onValueChange={setSelectedCategory} disabled={loadingCategories}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={loadingCategories ? "Loading..." : "All Categories"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category._id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setPriceRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-1000">₹0 - ₹1,000</SelectItem>
                <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                <SelectItem value="10000+">₹10,000+</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setDeliveryTime}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Delivery Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="3">Up to 3 Days</SelectItem>
                <SelectItem value="7">Up to 1 Week</SelectItem>
                <SelectItem value="14">Up to 2 Weeks</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-gray-500 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">No services found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <Card 
                  key={service._id} 
                  className="bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-200 cursor-pointer"
                  onClick={() => handleServiceClick(service._id)}
                >
                  <CardHeader className="pb-4">
                    {service.images && service.images.length > 0 && (
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={service.images.find(img => img.isPrimary)?.url || service.images[0]?.url} 
                          alt={service.images.find(img => img.isPrimary)?.alt || service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {service.freelancer.profilePicture ? (
                          <img 
                            src={service.freelancer.profilePicture} 
                            alt={`${service.freelancer.firstName} ${service.freelancer.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          `${service.freelancer.firstName?.[0]}${service.freelancer.lastName?.[0]}`
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {service.freelancer.firstName} {service.freelancer.lastName}
                        </p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">
                            {service.averageRating?.toFixed(1) || '0.0'} ({service.totalReviews || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                      {service.description}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                      {service.subcategory && (
                        <Badge variant="secondary" className="text-xs">
                          {service.subcategory}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.pricingPlans.basic.deliveryTime} day{service.pricingPlans.basic.deliveryTime !== 1 ? 's' : ''} delivery
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-lg font-bold text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(service.pricingPlans.basic.price)}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(service._id);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Services;