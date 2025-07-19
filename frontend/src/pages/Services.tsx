import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';
import { serviceAPI } from '@/api/services';
import { categoryAPI } from '@/api/categories';
import SidebarLayout from '@/components/SidebarLayout';
import ServiceCard from '@/components/ServiceCard';
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
    navigate(`/services/${serviceId}`);
  };

  return (
    <SidebarLayout>
      {/* Header Section */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-16 shadow-md rounded-b-3xl mb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-white mr-2" />
            <h1 className="text-5xl font-extrabold text-white tracking-tight">Browse Services</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-2xl">Find the perfect service for your needs, delivered by top freelancers.</p>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <section className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/4 mb-8 lg:mb-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select onValueChange={setSelectedCategory} disabled={loadingCategories}>
                  <SelectTrigger className="w-full rounded-lg border-gray-300">
                    <SelectValue placeholder={loadingCategories ? 'Loading...' : 'All Categories'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <Select onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full rounded-lg border-gray-300">
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                <Select onValueChange={setDeliveryTime}>
                  <SelectTrigger className="w-full rounded-lg border-gray-300">
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <Select onValueChange={setSortBy}>
                  <SelectTrigger className="w-full rounded-lg border-gray-300">
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
          </div>
        </aside>

        {/* Main Services Content */}
        <main className="flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-lg">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </form>

          {/* Services Grid */}
          {loading ? (
            <div className="text-center text-gray-500 py-16">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-purple-600 mx-auto mb-6"></div>
              <p className="text-lg font-semibold">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-xl font-semibold">No services found</p>
              <p className="text-gray-400 text-base mt-2">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {services.map(service => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onClick={handleServiceClick}
                />
              ))}
            </div>
          )}
        </main>
      </section>
    </SidebarLayout>
  );
};

export default Services;