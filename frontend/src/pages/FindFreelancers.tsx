import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface FreelancerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  skills?: Array<{ name: string; level: string }>;
  hourlyRate?: number;
  location?: { city: string; country: string };
  rating?: { average: number; count: number };
}

interface ApiResponse {
  success: boolean;
  data: FreelancerProfile[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

const FindFreelancers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchFreelancers();
  }, [selectedSkill, selectedCategory, minRating, sortBy, searchQuery]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSkill && selectedSkill !== 'all') params.append('skills', selectedSkill);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (minRating && minRating !== 'any') params.append('rating', minRating);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);

      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/users/freelancers?${params.toString()}`);
      setFreelancers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFreelancers();
  };

  const handleMessageClick = (freelancerId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/messages?freelancer=${freelancerId}`);
  };

  const skills = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "PHP", "Java",
    "Graphic Design", "UI/UX Design", "Digital Marketing", "Content Writing",
    "Video Editing", "WordPress", "Shopify", "SEO", "Social Media Marketing"
  ];

  const categories = [
    "Web Development", "Mobile Development", "Design & Creative", 
    "Writing & Translation", "Marketing & SEO", "Video & Animation"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Section */}
      <header className="bg-gradient-to-r from-purple-50 to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Talented Freelancers</h1>
          <p className="text-gray-600 text-lg">Connect with skilled professionals for your projects</p>
        </div>
      </header>

      {/* Search and Filters Section */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex items-center mb-6">
            <div className="flex rounded-md shadow-sm w-full">
              <Input
                type="text"
                placeholder="Search freelancers by name, skills, or location..."
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
            <Select onValueChange={setSelectedSkill}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {skills.map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setMinRating}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Rating</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="hourlyRate">Lowest Rate</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Freelancers Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-gray-500 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              Loading freelancers...
            </div>
          ) : freelancers.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">No freelancers found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelancers.map(freelancer => (
                <Card key={freelancer._id} className="bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {freelancer.profilePicture ? (
                          <img 
                            src={freelancer.profilePicture} 
                            alt={`${freelancer.firstName} ${freelancer.lastName}`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          `${freelancer.firstName?.[0]}${freelancer.lastName?.[0]}`
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {freelancer.firstName} {freelancer.lastName}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">
                            {freelancer.rating?.average?.toFixed(1) || '0.0'} ({freelancer.rating?.count || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                      {freelancer.bio || 'Professional freelancer ready to help with your projects.'}
                    </CardDescription>
                    
                    {freelancer.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {freelancer.location.city}, {freelancer.location.country}
                      </div>
                    )}

                    {freelancer.hourlyRate && (
                      <div className="flex items-center text-sm text-gray-700 mb-4">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{formatCurrency(freelancer.hourlyRate)}/hour</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {freelancer.skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                      {freelancer.skills && freelancer.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{freelancer.skills.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => navigate(`/freelancer/${freelancer._id}`)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleMessageClick(freelancer._id)}
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        Message
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

export default FindFreelancers;
