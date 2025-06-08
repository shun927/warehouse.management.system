'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Warehouse } from '@/types'; // Assuming Warehouse type is defined
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

const warehouseFormSchema = z.object({
  name: z.string().min(1, { message: 'Warehouse name is required.' }).max(100, { message: 'Warehouse name must be 100 characters or less.'}),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export default function EditWarehousePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (id) {
      const fetchWarehouse = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/warehouses/${id}`);
          if (!response.ok) {
            if (response.status === 404) {
              toast.error('Warehouse not found.');
              router.push('/locations'); // Or /admin/warehouses if that's the main list
              return;
            }
            throw new Error('Failed to fetch warehouse details');
          }
          const data: Warehouse = await response.json();
          setWarehouse(data);
          form.reset({ name: data.name });
        } catch (error) {
          console.error('Error fetching warehouse:', error);
          toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
          setIsLoading(false);
        }
      };
      fetchWarehouse();
    }
  }, [id, form, router]);

  const onSubmit = async (data: WarehouseFormValues) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/warehouses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update warehouse');
      }
      
      const updatedWarehouse = await response.json();
      toast.success(`Warehouse "${updatedWarehouse.name}" updated successfully!`);
      router.push('/locations');
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/warehouses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete warehouse');
      }
      toast.success('Warehouse deleted successfully!');
      router.push('/locations');
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading && !warehouse) {
    return <div className="container mx-auto p-4">Loading warehouse details...</div>;
  }

  if (!warehouse && !isLoading) {
    // This case is handled by the redirect in useEffect, but as a fallback:
    return <div className="container mx-auto p-4">Warehouse not found or failed to load.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/locations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Locations
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Edit Warehouse</CardTitle>
              <CardDescription>Update the details for "{warehouse?.name}".</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting || isLoading}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Warehouse
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the warehouse.
                    Make sure no boxes are currently in this warehouse.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Yes, delete warehouse'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Warehouse Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Storage, Lab Annex"
                {...form.register('name')}
                disabled={isLoading || isDeleting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isDeleting}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
