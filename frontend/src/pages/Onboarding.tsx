
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/api/auth";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [requirements, setRequirements] = useState<any>({});

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await authAPI.updateRequirements(requirements);
      
      toast({
        title: "Profile Setup Complete",
        description: "Welcome to Servpe! Let's get started.",
      });

      // Redirect based on user role
      if (currentUser.role === 'client') {
        navigate('/dashboard/client');
      } else if (currentUser.role === 'freelancer') {
        navigate('/dashboard/freelancer');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save requirements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  const isClient = currentUser.role === 'client';

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Welcome to Servpe, {currentUser.firstName}!
            </CardTitle>
            <CardDescription>
              Let's set up your profile to match you with the best {isClient ? 'freelancers' : 'projects'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {isClient ? 'What type of projects do you need help with?' : 'What services do you offer?'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Web Development',
                    'Mobile App Development',
                    'UI/UX Design',
                    'Graphic Design',
                    'Content Writing',
                    'Digital Marketing',
                    'Video Editing',
                    'SEO Services',
                    'Social Media Management'
                  ].map((category) => (
                    <Badge
                      key={category}
                      variant={
                        (isClient ? requirements.projectTypes : requirements.serviceCategories)?.includes(category) 
                          ? "default" 
                          : "outline"
                      }
                      className="cursor-pointer p-3 text-center justify-center hover:bg-orange-100"
                      onClick={() => {
                        const field = isClient ? 'projectTypes' : 'serviceCategories';
                        const current = requirements[field] || [];
                        if (current.includes(category)) {
                          setRequirements({
                            ...requirements,
                            [field]: current.filter((c: string) => c !== category)
                          });
                        } else {
                          setRequirements({
                            ...requirements,
                            [field]: [...current, category]
                          });
                        }
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => setStep(2)} 
                className="w-full bg-gradient-to-r from-orange-500 to-red-600"
                disabled={
                  !(isClient ? requirements.projectTypes?.length : requirements.serviceCategories?.length)
                }
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isClient ? 'Project Preferences' : 'Work Preferences'}
            </CardTitle>
            <CardDescription>
              Help us understand your {isClient ? 'project requirements' : 'work style'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isClient ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What's your typical project budget?</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Under $500', value: { min: 0, max: 500 } },
                        { label: '$500 - $2,000', value: { min: 500, max: 2000 } },
                        { label: '$2,000 - $5,000', value: { min: 2000, max: 5000 } },
                        { label: '$5,000+', value: { min: 5000, max: 50000 } }
                      ].map((budget) => (
                        <Badge
                          key={budget.label}
                          variant={requirements.budget?.min === budget.value.min ? "default" : "outline"}
                          className="cursor-pointer p-3 text-center justify-center hover:bg-orange-100"
                          onClick={() => setRequirements({ ...requirements, budget: budget.value })}
                        >
                          {budget.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">What's your typical timeline?</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Urgent (within 1 week)', 'Within 1 month', 'Within 3 months', 'Flexible timeline'].map((timeline) => (
                        <Badge
                          key={timeline}
                          variant={requirements.timeline === timeline ? "default" : "outline"}
                          className="cursor-pointer p-3 text-center justify-center hover:bg-orange-100"
                          onClick={() => setRequirements({ ...requirements, timeline })}
                        >
                          {timeline}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What's your experience level?</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['Beginner', 'Intermediate', 'Expert'].map((level) => (
                        <Badge
                          key={level}
                          variant={requirements.skillLevel === level ? "default" : "outline"}
                          className="cursor-pointer p-3 text-center justify-center hover:bg-orange-100"
                          onClick={() => setRequirements({ ...requirements, skillLevel: level })}
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">What's your availability?</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['Full-time', 'Part-time', 'Project-based'].map((availability) => (
                        <Badge
                          key={availability}
                          variant={requirements.availability === availability ? "default" : "outline"}
                          className="cursor-pointer p-3 text-center justify-center hover:bg-orange-100"
                          onClick={() => setRequirements({ ...requirements, availability })}
                        >
                          {availability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="w-full"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600"
                  disabled={isLoading || (!isClient && !requirements.skillLevel) || (isClient && !requirements.budget)}
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default Onboarding;
