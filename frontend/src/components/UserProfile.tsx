import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit, Save, X, Star, Settings, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import FreelancerProfileEdit from '@/components/FreelancerProfileEdit';

interface UserProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, isOwnProfile = true }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const { user: currentUser, updateUser } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      let response;
      if (isOwnProfile) {
        response = await authAPI.getMe();
        setUser(response.user);
      } else {
        response = await fetch(`http://localhost:8080/api/users/profile/${userId}`);
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </div>
    );
  }

  if (editMode && user.role === 'freelancer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <Button variant="outline" onClick={() => setEditMode(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
          <FreelancerProfileEdit />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  {user.username && (
                    <div className="flex items-center text-gray-600 mt-1">
                      <AtSign className="h-4 w-4 mr-1" />
                      <span className="text-lg font-medium">@{user.username}</span>
                    </div>
                  )}
                  <CardDescription className="text-lg mt-1">
                    {user.role === 'freelancer' ? 'Freelancer' : user.role === 'admin' ? 'Administrator' : 'Client'}
                  </CardDescription>
                  {user.role === 'freelancer' && user.rating && (
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">
                        {user.rating.average} ({user.rating.count} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {isOwnProfile && (
                <div className="space-x-2">
                  <Button onClick={() => setEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="contact">Contact & Settings</TabsTrigger>
            {user.role === 'freelancer' && <TabsTrigger value="professional">Professional</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {user.bio || 'No bio provided yet.'}
                </p>
              </CardContent>
            </Card>

            {/* Skills (for freelancers) */}
            {user.role === 'freelancer' && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {user.skills?.map((skill: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill.name} - {skill.level}
                        </Badge>
                      )) || <p className="text-gray-500">No skills added yet</p>}
                    </div>
                    {user.hourlyRate && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Hourly Rate</p>
                        <p className="text-lg font-semibold text-green-600">₹{user.hourlyRate}/hour</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Contact & Account Settings
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <div className="flex items-center mt-1">
                      <AtSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{user.username || 'Not set'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{user.email || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{user.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{user.location || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'freelancer' && (
            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.hourlyRate && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Hourly Rate</p>
                      <p className="text-lg font-semibold text-green-600">₹{user.hourlyRate}/hour</p>
                    </div>
                  )}
                  {user.experience && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience</p>
                      <p className="text-gray-700 mt-1">{user.experience}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;