'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createWarehouse } from '@/services/api'; // Assuming this function will be created

const warehouseFormSchema = z.object({
  name: z.string().min(1, { message: 'Warehouse name is required.' }).max(100, { message: 'Warehouse name must be 100 characters or less.'}),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export default function NewWarehousePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: WarehouseFormValues) => {
    setIsLoading(true);
    try {
      // const newWarehouse = await createWarehouse(data); // This will call POST /api/warehouses
      // For now, directly use fetch until createWarehouse is implemented in services/api.ts
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create warehouse');
      }
      
      const newWarehouse = await response.json();
      toast.success(`Warehouse "${newWarehouse.name}" created successfully!`);
      router.push('/locations'); // Redirect to locations page to see the new warehouse
      // router.push(\`/admin/warehouses/\${newWarehouse.id}\`); // Or redirect to an admin view of the warehouse
    } catch (error) {
      console.error('Error creating warehouse:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle>Create New Warehouse</CardTitle>
          <CardDescription>Fill in the details below to add a new warehouse.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Warehouse Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Storage, Lab Annex"
                {...form.register('name')}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Warehouse'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
