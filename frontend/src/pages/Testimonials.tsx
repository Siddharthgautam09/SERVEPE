import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, User } from 'lucide-react';

const Testimonials = () => {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockTestimonials = [
        {
          id: 1,
          clientName: "John Doe",
          clientAvatar: "",
          rating: 5,
          comment: "Excellent work! Very professional and delivered on time.",
          serviceName: "Website Development",
          date: "2024-01-15"
        },
        {
          id: 2,
          clientName: "Sarah Smith",
          clientAvatar: "",
          rating: 4,
          comment: "Great communication and quality work.",
          serviceName: "Logo Design",
          date: "2024-01-10"
        }
      ];
      setTestimonials(mockTestimonials);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading testimonials...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground">
            Reviews and feedback from your clients
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{testimonials.length}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{testimonials.length}</p>
                  <p className="text-sm text-muted-foreground">Happy Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials List */}
        <Card>
          <CardHeader>
            <CardTitle>Client Reviews</CardTitle>
            <CardDescription>
              Feedback from clients who have worked with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testimonials.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No testimonials yet</h3>
                <p className="text-muted-foreground">
                  Complete some orders to start receiving reviews from clients
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {testimonials.map((testimonial: any) => (
                  <div key={testimonial.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={testimonial.clientAvatar} />
                          <AvatarFallback>
                            {testimonial.clientName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{testimonial.clientName}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.serviceName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(testimonial.rating)}</div>
                        <Badge variant="secondary">{testimonial.rating}/5</Badge>
                      </div>
                    </div>
                    
                    <p className="text-foreground">{testimonial.comment}</p>
                    
                    <p className="text-sm text-muted-foreground">
                      {new Date(testimonial.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Testimonials;