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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Item, ItemType, Category, Box } from '@/types'; // Assuming these types are defined
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const itemFormSchema = z.object({
  name: z.string().min(1, { message: 'Item name is required.' }),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(0, { message: 'Quantity must be a non-negative integer.' }),
  type: z.nativeEnum(ItemType),
  categoryId: z.string().optional().nullable(), // Allow null or empty string for optional
  boxId: z.string().optional().nullable(), // Allow null or empty string for optional
  qrCodeUrl: z.string().url({ message: "Invalid URL format." }).optional().or(z.literal('')).nullable(), // Allow URL, empty string, or null
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: Item | null;
  // categories: Category[]; // Will be fetched internally
  // boxes: Box[]; // Will be fetched internally
}

export default function ItemFormModal({ 
  isOpen,
  onClose,
  itemToEdit,
}: ItemFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      quantity: 0,
      type: ItemType.COUNTABLE, // Default type
      categoryId: null,
      boxId: null,
      qrCodeUrl: '', // Default to empty string
    },
  });

  useEffect(() => {
    if (itemToEdit) {
      form.reset({
        name: itemToEdit.name,
        description: itemToEdit.description || '',
        quantity: itemToEdit.quantity,
        type: itemToEdit.type,
        categoryId: itemToEdit.categoryId || null, // Ensure null if undefined
        boxId: itemToEdit.boxId || null, // Ensure null if undefined
        qrCodeUrl: itemToEdit.qrCodeUrl || '', // Set to qrCodeUrl or empty string
      });
    } else {
      form.reset({ // Reset to default values for new item, ensuring optional fields are null or empty
        name: '',
        description: '',
        quantity: 0,
        type: ItemType.COUNTABLE,
        categoryId: null,
        boxId: null,
        qrCodeUrl: '', // Reset to empty string for new item
      });
    }
  }, [itemToEdit, form, isOpen]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, boxRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/boxes'),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        } else {
          toast.error("Failed to load categories.");
        }
        if (boxRes.ok) {
          const boxData = await boxRes.json();
          setBoxes(boxData);
        } else {
          toast.error("Failed to load boxes.");
        }
      } catch (error) {
        console.error("Failed to fetch categories/boxes", error);
        toast.error("Failed to load categories or boxes for the form.");
      }
    }
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const onSubmit = async (values: ItemFormValues) => {
    setIsSubmitting(true);
    const apiUrl = itemToEdit ? `/api/items/${itemToEdit.id}` : '/api/items';
    const method = itemToEdit ? 'PUT' : 'POST';

    const payload = {
      ...values,
      qrCodeUrl: values.qrCodeUrl === '' ? null : values.qrCodeUrl, // Convert empty string to null for API
    };

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (itemToEdit ? 'Failed to update item' : 'Failed to create item'));
      }

      toast.success(itemToEdit ? 'Item updated successfully!' : 'Item created successfully!');
      onClose(); // Close modal and trigger refresh in parent
    } catch (error: any) {
      toast.error(error.message);
      console.error('Form submission error:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {itemToEdit ? 'Update the details of the item.' : 'Fill in the details to add a new item.'}
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
                    <Input placeholder="e.g., Raspberry Pi 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional: Add any relevant details about the item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ItemType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* TODO: Replace with actual fetched data for Categories and Boxes */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="boxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Box</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a box (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Box</SelectItem>
                      {boxes.map((box) => (
                        <SelectItem key={box.id} value={box.id}>
                          {box.name} {box.warehouse ? `(${box.warehouse.name})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qrCodeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QR Code URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter QR Code URL or leave blank" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)} value={field.value ?? ''} />
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
                {isSubmitting ? (itemToEdit ? 'Saving...' : 'Creating...') : (itemToEdit ? 'Save Changes' : 'Create Item')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
