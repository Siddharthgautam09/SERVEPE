
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Calendar, Briefcase, Award, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const FreelancerProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [freelancer, setFreelancer] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancerProfile();
  }, [username]);

  const fetchFreelancerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/users/profile/${username}`);
      const data = await response.json();

      if (data.success) {
        setFreelancer(data.data.user);
        setServices(data.data.services || []);
        setReviews(data.data.reviews || []);
      } else {
        toast({
          title: "Error",
          description: "Freelancer not found",
          variant: "destructive",
        });
        navigate('/find-freelancers');
      }
    } catch (error) {
      console.error('Error fetching freelancer profile:', error);
      toast({
        title: "Error",
        description: "Failed to load freelancer profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${freelancer._id}`);
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Freelancer Not Found</h1>
          <Button onClick={() => navigate('/find-freelancers')}>
            Browse Freelancers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={freelancer.profilePicture} />
                <AvatarFallback className="text-2xl">
                  {freelancer.firstName[0]}{freelancer.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {freelancer.firstName} {freelancer.lastName}
                  </h1>
                  <Badge variant="secondary">@{freelancer.username}</Badge>
                </div>
                
                {freelancer.title && (
                  <p className="text-xl text-gray-600 mb-2">{freelancer.title}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  {freelancer.location && (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {freelancer.location}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(freelancer.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    {freelancer.rating?.average || 0} ({freelancer.rating?.count || 0} reviews)
                  </span>
                </div>

                {freelancer.bio && (
                  <p className="text-gray-700 mb-4">{freelancer.bio}</p>
                )}

                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {freelancer.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Button onClick={handleMessage} className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                {freelancer.hourlyRate && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Starting at</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{freelancer.hourlyRate}/hour
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card 
                  key={service._id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleServiceClick(service._id)}
                >
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={service.images?.[0]?.url || "/placeholder.svg"}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{service.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-sm">{service.averageRating || 0}</span>
                      </div>
                      <p className="font-semibold text-green-600">
                        ₹{service.pricingPlans?.basic?.price?.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {services.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No services available yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Showcase of completed work</CardDescription>
              </CardHeader>
              <CardContent>
                {freelancer.portfolio && freelancer.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {freelancer.portfolio.map((item: any, index: number) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={item.image || "/placeholder.svg"} 
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No portfolio items yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={review.client?.profilePicture} />
                        <AvatarFallback>
                          {review.client?.firstName[0]}{review.client?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            {review.client?.firstName} {review.client?.lastName}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {reviews.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No reviews yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FreelancerProfile;
