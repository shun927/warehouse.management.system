'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Category } from '@/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const categoryFormSchema = z.object({
  name: z.string().min(1, { message: 'Category name is required.' }),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export default function CategoryFormModal({ 
  isOpen,
  onClose,
  categoryToEdit,
}: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (categoryToEdit) {
      form.reset({
        name: categoryToEdit.name,
      });
    } else {
      form.reset({ name: '' }); // Reset for new category
    }
  }, [categoryToEdit, form, isOpen]);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    const apiUrl = categoryToEdit ? `/api/categories/${categoryToEdit.id}` : '/api/categories';
    const method = categoryToEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (categoryToEdit ? 'Failed to update category' : 'Failed to create category'));
      }

      toast.success(categoryToEdit ? 'Category updated successfully!' : 'Category created successfully!');
      onClose(); // Close modal and trigger refresh in parent
    } catch (error: any) {
      toast.error(error.message);
      console.error('Form submission error:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {categoryToEdit ? 'Update the name of the category.' : 'Enter the name for the new category.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics, Tools, Books" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (categoryToEdit ? 'Saving...' : 'Creating...') : (categoryToEdit ? 'Save Changes' : 'Create Category')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
