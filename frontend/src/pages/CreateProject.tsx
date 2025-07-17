
import React, { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { projectAPI } from '@/api/projects';
import { authAPI } from '@/api/auth';

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [] as string[],
    budget: {
      type: 'fixed',
      amount: {
        min: 0,
        max: 0
      }
    },
    duration: '',
    experienceLevel: 'intermediate'
  });
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'budgetMin' || name === 'budgetMax') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          amount: {
            ...prev.budget.amount,
            [name === 'budgetMin' ? 'min' : 'max']: Number(value)
          }
        }
      }));
    } else if (name === 'budgetType') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          type: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = authAPI.getCurrentUser();
    if (!user || user.role !== 'client') {
      toast({
        title: "Access Denied",
        description: "Only clients can create projects",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await projectAPI.createProject(formData);
      if (response.success) {
        toast({
          title: "Project Created",
          description: "Your project has been posted successfully!",
        });
        navigate('/dashboard/client');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard/client')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Create New Project</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Provide detailed information about your project to attract the right freelancers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Build a responsive e-commerce website"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project in detail..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Project Duration *</Label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select duration</option>
                    <option value="less-than-1-month">Less than 1 month</option>
                    <option value="1-3-months">1-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="more-than-6-months">More than 6 months</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="pr-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 p-0 h-4 w-4"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Budget</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetType">Budget Type</Label>
                    <select
                      id="budgetType"
                      name="budgetType"
                      value={formData.budget.type}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="hourly">Hourly Rate</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Min Budget ($)</Label>
                    <Input
                      id="budgetMin"
                      name="budgetMin"
                      type="number"
                      value={formData.budget.amount.min}
                      onChange={handleInputChange}
                      placeholder="500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Max Budget ($)</Label>
                    <Input
                      id="budgetMax"
                      name="budgetMax"
                      type="number"
                      value={formData.budget.amount.max}
                      onChange={handleInputChange}
                      placeholder="1500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Post Project"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/client')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProject;
