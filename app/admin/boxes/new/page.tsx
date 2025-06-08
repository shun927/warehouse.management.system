'use client';

import { Suspense, useEffect, useState } from 'react'; // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Warehouse } from '@/types'; // Ensure this type is correct and path is valid

const boxFormSchema = z.object({
  name: z.string().min(1, { message: 'Box name is required.' }).max(100, { message: 'Box name must be 100 characters or less.'}),
  warehouseId: z.string().min(1, { message: 'Warehouse selection is required.' }),
});

type BoxFormValues = z.infer<typeof boxFormSchema>;

// Renamed original component
function NewBoxPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedWarehouseId = searchParams.get('warehouseId');

  const [isLoading, setIsLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const form = useForm<BoxFormValues>({
    resolver: zodResolver(boxFormSchema),
    defaultValues: {
      name: '',
      warehouseId: preselectedWarehouseId || '',
    },
  });

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch('/api/warehouses');
        if (!response.ok) {
          throw new Error('Failed to fetch warehouses');
        }
        const data: Warehouse[] = await response.json();
        setWarehouses(data);
        if (preselectedWarehouseId && data.some(wh => wh.id === preselectedWarehouseId)) {
          form.setValue('warehouseId', preselectedWarehouseId);
        } else if (data.length > 0 && !preselectedWarehouseId) {
          // Optionally set to first warehouse if no preselection and warehouses exist
          // form.setValue('warehouseId', data[0].id);
        }
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        toast.error('Could not load warehouses. Please try again.');
      }
    };
    fetchWarehouses();
  }, [preselectedWarehouseId, form]);

  const onSubmit = async (data: BoxFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/boxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create box');
      }
      
      const newBox = await response.json();
      toast.success(`Box \"${newBox.name}\" created successfully in warehouse \"${warehouses.find(wh => wh.id === newBox.warehouseId)?.name}\"!`);
      router.push('/locations'); // Redirect to locations page
      // router.push(`/boxes/${newBox.id}`); // Or redirect to the new box details page
    } catch (error) {
      console.error('Error creating box:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/locations"> {/* Adjusted link based on typical admin structure, might need to be /admin/locations or /admin/boxes */}
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Locations/Boxes {/* Adjusted text */}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Create New Box</CardTitle>
          <CardDescription>Fill in the details below to add a new box.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Box Name</Label>
              <Input
                id="name"
                placeholder="e.g., Microcontrollers, Sensor Kit Alpha"
                {...form.register('name')}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouseId">Warehouse</Label>
              <Select
                value={form.watch('warehouseId')}
                onValueChange={(value) => form.setValue('warehouseId', value, { shouldValidate: true })}
                disabled={isLoading || warehouses.length === 0}
              >
                <SelectTrigger id="warehouseId">
                  <SelectValue placeholder={warehouses.length === 0 ? "Loading warehouses..." : "Select a warehouse"} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.warehouseId && (
                <p className="text-sm text-red-500">{form.formState.errors.warehouseId.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Box'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// New page component that wraps Content in Suspense
export default function NewBoxPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <NewBoxPageContent />
    </Suspense>
  );
}
