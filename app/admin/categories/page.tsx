'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, ListFilter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Category } from '@/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// Import CategoryFormModal (will be created next)
import CategoryFormModal from '@/components/modals/CategoryFormModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      // The categories API currently doesn't support search, but we keep the structure for future enhancements
      const response = await fetch(`/api/categories${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error fetching categories', { description: err.message });
      console.error('Error fetching categories:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories(searchTerm);
  }, [fetchCategories, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenModal = (category: Category | null = null) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryToEdit(null);
    fetchCategories(searchTerm); // Refresh categories after modal closes
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
      toast.success(`Category "${categoryToDelete.name}" deleted successfully!`);
      setCategoryToDelete(null);
      fetchCategories(searchTerm);
    } catch (err: any) {
      toast.error('Error deleting category', { description: err.message });
      console.error('Error deleting category:', err);
      setCategoryToDelete(null); // Clear even on error
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">Error loading categories: {error}</div>;
  }

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Category
        </Button>
      </div>

      <div className="mb-4 flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 && !searchTerm ? (
        <div className="text-center py-12">
          <ListFilter className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No categories found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click "Add New Category" to get started.</p>
        </div>
      ) : filteredCategories.length === 0 && searchTerm ? (
         <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No categories match "{searchTerm}"</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search term or clear the search.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-2 justify-end">
                      <Button variant="outline" size="icon" title="Edit Category" onClick={() => handleOpenModal(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Delete Category" onClick={() => setCategoryToDelete(category)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isModalOpen && (
        <CategoryFormModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          categoryToEdit={categoryToEdit} 
        />
      )}

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete "{categoryToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category.
                If items are associated with this category, deletion might be prevented.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-600 hover:bg-red-700">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-4 text-sm text-muted-foreground">
        Displaying {filteredCategories.length} of {categories.length} category(s).
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </p>
    </div>
  );
}
