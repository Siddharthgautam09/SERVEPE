
import { useState, useEffect } from "react";
import { Plus, Eye, Heart, Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { freelancerProjectAPI } from "@/api/freelancerProjects";
import { ApiResponse } from "@/types/api";
import Navbar from "@/components/Navbar";

const FreelancerProjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response: ApiResponse = await freelancerProjectAPI.getMyProjects();
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600">Showcase your work and attract clients</p>
          </div>
          <Button onClick={() => navigate('/post-project')} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Post New Project
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No projects posted yet</p>
            <Button onClick={() => navigate('/post-project')} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={project.images?.[0]?.url || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{project.category}</Badge>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>{project.views || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>{project.likes || 0} likes</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.skills?.slice(0, 3).map((skill: string) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {project.skills?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline">
                      View Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerProjects;
