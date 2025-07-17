
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { categoryAPI, Category, Subcategory } from "@/api/categories";

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState<{ [key: string]: { name: string; description: string } }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAdminCategories();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('Fetch categories error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both name and description",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await categoryAPI.createCategory(newCategory);
      if (response.success) {
        setCategories([...categories, response.data!]);
        setNewCategory({ name: '', description: '' });
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (error: any) {
      console.error('Create category error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editData.name.trim() || !editData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both name and description",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await categoryAPI.updateCategory(id, editData);
      if (response.success) {
        setCategories(categories.map(cat => 
          cat._id === id ? response.data! : cat
        ));
        setEditingId(null);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to update category');
      }
    } catch (error: any) {
      console.error('Update category error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await categoryAPI.deleteCategory(id);
      if (response.success) {
        setCategories(categories.filter(cat => cat._id !== id));
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Delete category error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    const subcategoryData = newSubcategory[categoryId];
    if (!subcategoryData?.name.trim() || !subcategoryData?.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both subcategory name and description",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await categoryAPI.addSubcategory(categoryId, subcategoryData);
      if (response.success) {
        setCategories(categories.map(cat => 
          cat._id === categoryId ? response.data! : cat
        ));
        setNewSubcategory({ ...newSubcategory, [categoryId]: { name: '', description: '' } });
        toast({
          title: "Success",
          description: "Subcategory added successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to add subcategory');
      }
    } catch (error: any) {
      console.error('Add subcategory error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add subcategory",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (!editData.name.trim() || !editData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both name and description",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await categoryAPI.updateSubcategory(categoryId, subcategoryId, editData);
      if (response.success) {
        setCategories(categories.map(cat => 
          cat._id === categoryId ? response.data! : cat
        ));
        setEditingSubcategoryId(null);
        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to update subcategory');
      }
    } catch (error: any) {
      console.error('Update subcategory error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update subcategory",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? This action cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await categoryAPI.deleteSubcategory(categoryId, subcategoryId);
      if (response.success) {
        setCategories(categories.map(cat => 
          cat._id === categoryId 
            ? { ...cat, subcategories: cat.subcategories.filter(sub => sub._id !== subcategoryId) }
            : cat
        ));
        toast({
          title: "Success",
          description: "Subcategory deleted successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to delete subcategory');
      }
    } catch (error: any) {
      console.error('Delete subcategory error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete subcategory",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category._id);
    setEditData({ name: category.name, description: category.description });
  };

  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategoryId(subcategory._id);
    setEditData({ name: subcategory.name, description: subcategory.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingSubcategoryId(null);
    setEditData({ name: '', description: '' });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <Badge variant="outline">{categories.length} Categories</Badge>
      </div>

      {/* Add New Category */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>Create categories for freelancers to list their services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Category name (e.g., Video Editing, App Development)"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              disabled={submitting}
            />
            <Input
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              disabled={submitting}
            />
            <Button 
              onClick={handleCreateCategory} 
              disabled={!newCategory.name.trim() || !newCategory.description.trim() || submitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              {submitting ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
          <CardDescription>Manage your service categories and subcategories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  {editingId === category._id ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        disabled={submitting}
                      />
                      <Input
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        disabled={submitting}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateCategory(category._id)}
                        disabled={submitting}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEdit}
                        disabled={submitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(category._id)}
                          className="p-1"
                        >
                          {expandedCategories[category._id] ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {category.servicesCount} services • {category.subcategories.length} subcategories
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              Created {new Date(category.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => startEdit(category)}
                          disabled={submitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteCategory(category._id)}
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Subcategories Section */}
                {expandedCategories[category._id] && (
                  <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                    {/* Add Subcategory */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Subcategory name"
                        value={newSubcategory[category._id]?.name || ''}
                        onChange={(e) => setNewSubcategory({
                          ...newSubcategory,
                          [category._id]: {
                            ...newSubcategory[category._id],
                            name: e.target.value,
                            description: newSubcategory[category._id]?.description || ''
                          }
                        })}
                        disabled={submitting}
                      />
                      <Input
                        placeholder="Subcategory description"
                        value={newSubcategory[category._id]?.description || ''}
                        onChange={(e) => setNewSubcategory({
                          ...newSubcategory,
                          [category._id]: {
                            ...newSubcategory[category._id],
                            description: e.target.value,
                            name: newSubcategory[category._id]?.name || ''
                          }
                        })}
                        disabled={submitting}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddSubcategory(category._id)}
                        disabled={submitting}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Sub
                      </Button>
                    </div>

                    {/* Subcategories List */}
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory._id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        {editingSubcategoryId === subcategory._id ? (
                          <div className="flex gap-2 flex-1">
                            <Input
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              disabled={submitting}
                            />
                            <Input
                              value={editData.description}
                              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                              disabled={submitting}
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateSubcategory(category._id, subcategory._id)}
                              disabled={submitting}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEdit}
                              disabled={submitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{subcategory.name}</h4>
                              <p className="text-xs text-gray-600">{subcategory.description}</p>
                              <span className="text-xs text-gray-500">
                                {subcategory.servicesCount} services
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={subcategory.isActive ? "default" : "secondary"} className="text-xs">
                                {subcategory.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => startEditSubcategory(subcategory)}
                                disabled={submitting}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDeleteSubcategory(category._id, subcategory._id)}
                                disabled={submitting}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {category.subcategories.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No subcategories yet. Add one above.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No categories yet. Create your first category above.</p>
                <p className="text-sm text-gray-400">Categories help organize services and make them easier to find.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
