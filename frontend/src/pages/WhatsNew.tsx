import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  MessageSquare, 
  Shield, 
  Zap,
  Star,
  Calendar,
  ArrowRight
} from 'lucide-react';

const WhatsNew = () => {
  const updates = [
    {
      id: 1,
      title: "Enhanced Chat System",
      description: "Real-time messaging with file sharing, voice notes, and read receipts for better communication with clients.",
      date: "2024-01-15",
      type: "feature",
      icon: MessageSquare,
      isNew: true
    },
    {
      id: 2,
      title: "Advanced Analytics Dashboard",
      description: "Get detailed insights into your performance with new charts, metrics, and earning projections.",
      date: "2024-01-10",
      type: "improvement",
      icon: Sparkles,
      isNew: true
    },
    {
      id: 3,
      title: "Two-Factor Authentication",
      description: "Secure your account with 2FA using SMS or authenticator apps for enhanced security.",
      date: "2024-01-05",
      type: "security",
      icon: Shield,
      isNew: false
    },
    {
      id: 4,
      title: "Faster Payment Processing",
      description: "Payouts now process 50% faster with our new payment infrastructure and instant notifications.",
      date: "2023-12-28",
      type: "improvement",
      icon: Zap,
      isNew: false
    },
    {
      id: 5,
      title: "Client Review System",
      description: "Enhanced review system with detailed feedback categories and improved rating display.",
      date: "2023-12-20",
      type: "feature",
      icon: Star,
      isNew: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-blue-100 text-blue-800';
      case 'improvement':
        return 'bg-green-100 text-green-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return 'New Feature';
      case 'improvement':
        return 'Improvement';
      case 'security':
        return 'Security';
      default:
        return 'Update';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">What's New</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest features, improvements, and platform updates
          </p>
        </div>

        {/* Latest Updates Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-foreground">Latest Update</h2>
                  <Badge className="bg-blue-600">v2.1.0</Badge>
                </div>
                <p className="text-muted-foreground">
                  Enhanced chat system with real-time messaging and file sharing capabilities
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Learn More
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Updates Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>
              All platform updates, new features, and improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {updates.map((update, index) => {
                const Icon = update.icon;
                return (
                  <div key={update.id} className="relative">
                    {/* Timeline line */}
                    {index !== updates.length - 1 && (
                      <div className="absolute left-6 top-12 w-px h-16 bg-border" />
                    )}
                    
                    <div className="flex space-x-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-foreground">
                              {update.title}
                            </h3>
                            {update.isNew && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getTypeColor(update.type)}>
                              {getTypeLabel(update.type)}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(update.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          {update.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Features */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Features we're working on for future releases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium text-foreground">Video Calls</h4>
                <p className="text-sm text-muted-foreground">
                  Built-in video calling for client consultations
                </p>
                <Badge variant="outline">Q2 2024</Badge>
              </div>
              
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium text-foreground">Mobile App</h4>
                <p className="text-sm text-muted-foreground">
                  Native mobile apps for iOS and Android
                </p>
                <Badge variant="outline">Q3 2024</Badge>
              </div>
              
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium text-foreground">Team Collaboration</h4>
                <p className="text-sm text-muted-foreground">
                  Work with teams on larger projects
                </p>
                <Badge variant="outline">Q4 2024</Badge>
              </div>
              
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium text-foreground">AI Assistant</h4>
                <p className="text-sm text-muted-foreground">
                  AI-powered project recommendations and insights
                </p>
                <Badge variant="outline">2025</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Have suggestions for new features?
              </h3>
              <p className="text-muted-foreground">
                We'd love to hear your ideas for improving the platform
              </p>
              <Button variant="outline">
                Send Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsNew;