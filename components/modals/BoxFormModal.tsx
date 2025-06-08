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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Box, Warehouse } from '@/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const boxFormSchema = z.object({
  name: z.string().min(1, { message: 'Box name is required.' }),
  warehouseId: z.string().min(1, { message: 'Warehouse is required.' }),
  qrCodeUrl: z.string().optional().nullable(), // Optional, can be empty or null
});

type BoxFormValues = z.infer<typeof boxFormSchema>;

interface BoxFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  boxToEdit?: Box | null;
  warehouses: Warehouse[]; // Pass the list of warehouses
}

export default function BoxFormModal({ 
  isOpen,
  onClose,
  boxToEdit,
  warehouses,
}: BoxFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BoxFormValues>({
    resolver: zodResolver(boxFormSchema),
    defaultValues: {
      name: '',
      warehouseId: '',
      qrCodeUrl: '',
    },
  });

  useEffect(() => {
    if (boxToEdit) {
      form.reset({
        name: boxToEdit.name,
        warehouseId: boxToEdit.warehouseId,
        qrCodeUrl: boxToEdit.qrCodeUrl || '',
      });
    } else {
      form.reset({ name: '', warehouseId: '', qrCodeUrl: '' }); // Reset for new box
    }
  }, [boxToEdit, form, isOpen]);

  const onSubmit = async (values: BoxFormValues) => {
    setIsSubmitting(true);
    const apiUrl = boxToEdit ? `/api/boxes/${boxToEdit.id}` : '/api/boxes';
    const method = boxToEdit ? 'PUT' : 'POST';

    const payload = {
        ...values,
        qrCodeUrl: values.qrCodeUrl || null, // Ensure empty string becomes null if backend expects null
    };

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (boxToEdit ? 'Failed to update box' : 'Failed to create box'));
      }

      toast.success(boxToEdit ? 'Box updated successfully!' : 'Box created successfully!');
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
          <DialogTitle>{boxToEdit ? 'Edit Box' : 'Add New Box'}</DialogTitle>
          <DialogDescription>
            {boxToEdit ? 'Update the details of the box.' : 'Fill in the details to add a new box.'}
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
                    <Input placeholder="e.g., Box A-01, Shelf 3, Rack 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
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
                    <Input placeholder="Leave blank to auto-generate or if not applicable" {...field} value={field.value ?? ''} />
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
                {isSubmitting ? (boxToEdit ? 'Saving...' : 'Creating...') : (boxToEdit ? 'Save Changes' : 'Create Box')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
