import React, { useState, useEffect } from 'react';
import { Search, AtSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface SearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
  role: string;
}

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  message?: string;
}

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<SearchResponse>(`${API_BASE_URL}/users/search/${searchTerm}`);
        if (response.data.success) {
          setResults(response.data.data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleUserClick = (user: SearchResult) => {
    if (user.role === 'freelancer') {
      navigate(`/freelancer/${user.username}`);
    } else {
      navigate(`/profile/${user.username}`);
    }
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search users by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="pl-10"
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <div className="divide-y">
                {results.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <AtSign className="h-3 w-3 mr-1" />
                        <span>@{user.username}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSearch;