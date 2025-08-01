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
// import SidebarLayout from '@/components/SidebarLayout';
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
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <header className="bg-white py-4 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/public/images/logo-2.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl text-gray-800">SERVPE</span>
          </div>
          <div className="flex-1 flex items-center max-w-lg mx-auto">
            <Input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* User avatar/menu if needed */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 max-w-xs mb-8 md:mb-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">All Filters</h2>
              <a href="#" className="text-xs text-blue-600 font-semibold">Applied (4)</a>
            </div>
            {/* Price Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">₹0</span>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  className="flex-1 accent-blue-500"
                  // Add value/onChange if you want to wire it up
                />
                <span className="text-xs text-gray-500">₹1000</span>
              </div>
            </div>
            {/* Delivery Time */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-blue-500" />
                  24 Hours
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-blue-500" />
                  3 Days
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-blue-500" />
                  7 Days
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-blue-500" />
                  30 Days
                </label>
              </div>
            </div>
            {/* Talent Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Talent Level</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-blue-500" />
                  Fresher Freelancer
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-blue-500" />
                  Verified Freelancer
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-blue-500" />
                  Top Rated Freelancer
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-blue-500" />
                  Pro Talent
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Category Chips */}
          <div className="bg-[#FFF6F2] py-3 px-4 mb-6 overflow-x-auto rounded-xl">
            <div className="flex gap-3 w-max">
              <Button variant="outline" className="rounded-full bg-white border border-gray-200 shadow-sm px-6 py-2 font-medium text-gray-700">Full Stack Development</Button>
              <Button variant="outline" className="rounded-full bg-black text-white px-6 py-2 font-medium">Backend Development</Button>
              <Button variant="outline" className="rounded-full bg-white border border-gray-200 shadow-sm px-6 py-2 font-medium text-gray-700">Backend Development</Button>
              <Button variant="outline" className="rounded-full bg-white border border-gray-200 shadow-sm px-6 py-2 font-medium text-gray-700">Backend Development</Button>
              <Button variant="outline" className="rounded-full bg-white border border-gray-200 shadow-sm px-6 py-2 font-medium text-gray-700">Backend Development</Button>
              <Button variant="outline" className="rounded-full bg-white border border-gray-200 shadow-sm px-6 py-2 font-medium text-gray-700">Backend Development</Button>
              <Button variant="outline" className="rounded-full bg-white border border-gray-200 shadow-sm px-6 py-2 font-medium text-gray-700">Backend Development Devops</Button>
            </div>
          </div>
          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Minimalist logo design</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </div>
    </div>
  );
};

export default Services;