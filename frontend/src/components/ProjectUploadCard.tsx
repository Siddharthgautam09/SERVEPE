
import { useState } from "react";
import { Upload, Plus, X, FileText, Clock, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ProjectUploadCardProps {
  onSubmit: (projectData: any) => void;
  onCancel?: () => void;
}

const ProjectUploadCard = ({ onSubmit, onCancel }: ProjectUploadCardProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
    skills: [] as string[],
    attachments: [] as File[]
  });
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files].slice(0, 5) // Max 5 files
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
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
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      toast({
        title: "Project Posted",
        description: "Your project has been posted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 animate-scale-in">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2 text-2xl animate-fade-in">
          <FileText className="h-6 w-6" />
          <span>Post Your Project</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Label htmlFor="title" className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <span>Project Title</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="I need a responsive e-commerce website"
              className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 hover:border-gray-300"
              required
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <Label htmlFor="description" className="text-lg font-semibold">
              Project Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your project requirements, features, and any specific details..."
              rows={5}
              className="border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 hover:border-gray-300"
              required
            />
          </div>

          {/* Category and Budget Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-lg font-semibold flex items-center space-x-2">
                <Tag className="h-4 w-4 text-blue-500" />
                <span>Category</span>
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Web Development"
                className="border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 hover:border-gray-300"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-lg font-semibold flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span>Budget ($)</span>
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="500"
                className="border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 hover:border-gray-300"
                required
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <Label htmlFor="deadline" className="text-lg font-semibold flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>Project Deadline</span>
            </Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleInputChange}
              className="border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 hover:border-gray-300"
              required
            />
          </div>

          {/* Skills Required */}
          <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Label className="text-lg font-semibold">Skills Required</Label>
            <div className="flex space-x-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g., React, PHP, Design)"
                className="border-2 border-gray-200 focus:border-orange-500 transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button 
                type="button" 
                onClick={addSkill} 
                variant="outline"
                className="hover:bg-orange-50 hover:border-orange-500 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills.map((skill, index) => (
                <Badge 
                  key={skill} 
                  variant="secondary" 
                  className="pr-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200 animate-scale-in hover:scale-105 transition-transform duration-200"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {skill}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 p-0 h-4 w-4 hover:bg-red-200 transition-colors"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.7s'}}>
            <Label className="text-lg font-semibold flex items-center space-x-2">
              <Upload className="h-4 w-4 text-indigo-500" />
              <span>Project Files (Optional)</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-400 transition-all duration-200 hover:bg-orange-50">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-center">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3 hover:text-orange-500 transition-colors" />
                  <p className="text-gray-600 font-medium">Click to upload project files</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, Images, ZIP (Max 5 files)</p>
                </div>
              </label>
              
              {formData.attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {formData.attachments.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg border animate-scale-in"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6 hover:bg-red-200 transition-colors"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4 animate-fade-in" style={{animationDelay: '0.8s'}}>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 text-lg font-semibold hover:scale-105 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Project"}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="px-8 py-3 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectUploadCard;
