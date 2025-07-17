
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderTree, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';

const Categories = () => {
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', description: '', categoryId: '' });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [adminToken, setAdminToken] = useState('');
  const queryClient = useQueryClient();

  // Get admin token on component mount
  useEffect(() => {
    const getAdminToken = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
          }),
        });
        
        const data = await response.json();
        if (data.success && data.token) {
          setAdminToken(data.token);
          localStorage.setItem('admin_token', data.token);
        }
      } catch (error) {
        console.error('Failed to get admin token:', error);
      }
    };

    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setAdminToken(storedToken);
    } else {
      getAdminToken();
    }
  }, []);

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8080/api/categories/admin', {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }
      return response.json();
    },
    enabled: !!adminToken
  });

  const createMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const response = await fetch('http://localhost:8080/api/categories/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(categoryData),
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewCategory({ name: '', description: '' });
      setIsDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: any) => {
      const response = await fetch(`http://localhost:8080/api/categories/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(categoryData),
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:8080/api/categories/admin/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: async ({ categoryId, ...subcategoryData }: any) => {
      const response = await fetch(`http://localhost:8080/api/categories/admin/${categoryId}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(subcategoryData),
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewSubcategory({ name: '', description: '', categoryId: '' });
      setIsSubcategoryDialogOpen(false);
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: async ({ categoryId, subcategoryId, ...subcategoryData }: any) => {
      const response = await fetch(`http://localhost:8080/api/categories/admin/${categoryId}/subcategories/${subcategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(subcategoryData),
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditingSubcategory(null);
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: async ({ categoryId, subcategoryId }: any) => {
      const response = await fetch(`http://localhost:8080/api/categories/admin/${categoryId}/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const categories = categoriesData?.data || [];

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newCategory);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate(editingCategory);
    }
  };

  const handleCreateSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    createSubcategoryMutation.mutate(newSubcategory);
  };

  const handleUpdateSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubcategory) {
      updateSubcategoryMutation.mutate({
        categoryId: editingSubcategory.categoryId,
        subcategoryId: editingSubcategory._id,
        name: editingSubcategory.name,
        description: editingSubcategory.description,
        isActive: editingSubcategory.isActive
      });
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (isLoading || !adminToken) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-2">Manage service categories and subcategories</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new service category to the platform
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                  />
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Category'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categories ({categories.length})</CardTitle>
            <CardDescription>
              Manage all service categories and their subcategories on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category: any) => (
                <div key={category._id} className="border rounded-lg">
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryExpansion(category._id)}
                        className="p-0 h-auto"
                      >
                        {expandedCategories.has(category._id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {category.subcategories?.length || 0} subcategories
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Created {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewSubcategory({ name: '', description: '', categoryId: category._id });
                          setIsSubcategoryDialogOpen(true);
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(category._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {expandedCategories.has(category._id) && category.subcategories && category.subcategories.length > 0 && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="space-y-2">
                        {category.subcategories.map((subcategory: any) => (
                          <div key={subcategory._id} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <h4 className="font-medium text-sm">{subcategory.name}</h4>
                              <p className="text-xs text-gray-600">{subcategory.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={subcategory.isActive ? "default" : "secondary"}>
                                {subcategory.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSubcategory({
                                    ...subcategory,
                                    categoryId: category._id
                                  });
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSubcategoryMutation.mutate({
                                  categoryId: category._id,
                                  subcategoryId: subcategory._id
                                })}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category information
              </DialogDescription>
            </DialogHeader>
            {editingCategory && (
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Category Name</Label>
                  <Input
                    id="edit-name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                  />
                </div>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Category'}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Subcategory Dialog */}
        <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subcategory</DialogTitle>
              <DialogDescription>
                Add a new subcategory to this category
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubcategory} className="space-y-4">
              <div>
                <Label htmlFor="sub-name">Subcategory Name</Label>
                <Input
                  id="sub-name"
                  value={newSubcategory.name}
                  onChange={(e) => setNewSubcategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter subcategory name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sub-description">Description</Label>
                <Input
                  id="sub-description"
                  value={newSubcategory.description}
                  onChange={(e) => setNewSubcategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter subcategory description"
                />
              </div>
              <Button type="submit" disabled={createSubcategoryMutation.isPending}>
                {createSubcategoryMutation.isPending ? 'Creating...' : 'Create Subcategory'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Subcategory Dialog */}
        <Dialog open={!!editingSubcategory} onOpenChange={() => setEditingSubcategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subcategory</DialogTitle>
              <DialogDescription>
                Update subcategory information
              </DialogDescription>
            </DialogHeader>
            {editingSubcategory && (
              <form onSubmit={handleUpdateSubcategory} className="space-y-4">
                <div>
                  <Label htmlFor="edit-sub-name">Subcategory Name</Label>
                  <Input
                    id="edit-sub-name"
                    value={editingSubcategory.name}
                    onChange={(e) => setEditingSubcategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter subcategory name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sub-description">Description</Label>
                  <Input
                    id="edit-sub-description"
                    value={editingSubcategory.description}
                    onChange={(e) => setEditingSubcategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter subcategory description"
                  />
                </div>
                <Button type="submit" disabled={updateSubcategoryMutation.isPending}>
                  {updateSubcategoryMutation.isPending ? 'Updating...' : 'Update Subcategory'}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Categories;
