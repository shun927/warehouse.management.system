// components/locations/BoxMoveForm.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Box, Warehouse } from '@prisma/client'; // Assuming Prisma types are available
// If not, define local types or import from @/types if they exist there
// type BoxWithWarehouse = Box & { warehouse: Warehouse }; // Example if you pass the full box object with current warehouse

const formSchema = z.object({
  toWarehouseId: z.string().uuid({ message: 'Please select a target warehouse.' }),
});

interface BoxMoveFormProps {
  box: Box; // Or BoxWithWarehouse if you need current warehouse info displayed here too
  warehouses: Warehouse[]; // List of target warehouses (excluding current one)
}

export default function BoxMoveForm({ box, warehouses }: BoxMoveFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toWarehouseId: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(`/api/boxes/${box.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toWarehouseId: values.toWarehouseId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to move box. Please try again.');
      }

      toast.success(`Box "${box.name}" moved successfully!`);
      router.push('/locations'); // Redirect to locations page or box details page
      router.refresh(); // Refresh server components on the target page
    } catch (error) {
      console.error('Error moving box:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
        <FormField
          control={form.control}
          name="toWarehouseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Move to Warehouse</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a warehouse..." />
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
              <FormDescription>
                Select the new warehouse for this box.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting || warehouses.length === 0}>
          {form.formState.isSubmitting ? 'Moving...' : 'Move Box'}
        </Button>
      </form>
    </Form>
  );
}
