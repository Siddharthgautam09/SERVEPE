
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, MessageSquare, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { proposalAPI } from '@/api/proposals';
import { authAPI } from '@/api/auth';
import Chat from '@/components/Chat';

const MyProposals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [chatOpen, setChatOpen] = useState<string | null>(null);
  const [chatRecipient, setChatRecipient] = useState<any>(null);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user || user.role !== 'freelancer') {
      navigate('/login');
      return;
    }
    fetchProposals();
  }, [filter]);

  const fetchProposals = async () => {
    try {
      const response = await proposalAPI.getMyProposals({ 
        status: filter === 'all' ? undefined : filter 
      });
      if (response.success) {
        setProposals(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load proposals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openChat = (proposal: any) => {
    setChatRecipient({
      id: proposal.project.client._id,
      name: `${proposal.project.client.firstName} ${proposal.project.client.lastName}`
    });
    setChatOpen(proposal.project.client._id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (chatOpen && chatRecipient) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setChatOpen(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
          <Chat 
            recipientId={chatRecipient.id}
            recipientName={chatRecipient.name}
            onClose={() => setChatOpen(null)}
          />
        </div>
      </div>
    );
  }

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
                onClick={() => navigate('/dashboard/freelancer')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">My Proposals</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                size="sm"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No proposals found</p>
              <Button onClick={() => navigate('/projects')}>
                Browse Projects
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal: any) => (
              <Card key={proposal._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {proposal.project.title}
                      </CardTitle>
                      <CardDescription>
                        Client: {proposal.project.client?.firstName} {proposal.project.client?.lastName}
                      </CardDescription>
                      <div className="flex items-center mt-2 space-x-4">
                        <Badge className={getStatusColor(proposal.status)}>
                          {getStatusIcon(proposal.status)}
                          <span className="ml-1">{proposal.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Submitted {new Date(proposal.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-lg font-semibold text-green-600">
                        <DollarSign className="h-5 w-5 mr-1" />
                        {proposal.proposedBudget.amount}
                      </div>
                      <p className="text-sm text-gray-500">
                        {proposal.proposedBudget.type}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <p className="text-gray-700 text-sm">{proposal.coverLetter}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Estimated Duration</h4>
                      <p className="text-gray-700 text-sm">{proposal.estimatedDuration}</p>
                    </div>

                    {proposal.clientMessage && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Client Response</h4>
                        <p className="text-blue-800 text-sm">{proposal.clientMessage}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/project/${proposal.project._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Project
                        </Button>
                        {proposal.status === 'accepted' && (
                          <Button 
                            size="sm"
                            onClick={() => openChat(proposal)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat with Client
                          </Button>
                        )}
                      </div>
                      
                      {proposal.respondedAt && (
                        <span className="text-sm text-gray-500">
                          Responded {new Date(proposal.respondedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
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

export default MyProposals;
