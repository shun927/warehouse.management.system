'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, BoxIcon, Search, Warehouse } from 'lucide-react'; // Using BoxIcon for consistency
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
import { Box, Warehouse as WarehouseType } from '@/types'; // Renamed to avoid conflict
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
// Import BoxFormModal (will be created next)
import BoxFormModal from '@/components/modals/BoxFormModal';

interface EnrichedBox extends Box {
  warehouseName?: string;
}

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<EnrichedBox[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boxToEdit, setBoxToEdit] = useState<EnrichedBox | null>(null);
  const [boxToDelete, setBoxToDelete] = useState<EnrichedBox | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]); // For the form modal

  const fetchWarehouses = useCallback(async () => {
    try {
      // Assuming an API endpoint for warehouses exists or will be created
      // For now, this might be a placeholder if /api/warehouses is not yet implemented
      const response = await fetch('/api/warehouses'); // TODO: Create /api/warehouses if it doesn't exist
      if (!response.ok) {
        throw new Error('Failed to fetch warehouses');
      }
      const data = await response.json();
      setWarehouses(data);
    } catch (err: any) {
      toast.error('Error fetching warehouses', { description: err.message });
      console.error('Error fetching warehouses:', err);
    }
  }, []);

  const fetchBoxes = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      // The boxes API currently doesn't support search query param, filtering is client-side for now
      const response = await fetch(`/api/boxes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch boxes: ${response.statusText}`);
      }
      const data: Box[] = await response.json();
      const enrichedData = data.map(box => ({
        ...box,
        warehouseName: box.warehouse?.name || 'N/A', // Access nested warehouse name
      }));
      setBoxes(enrichedData);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error fetching boxes', { description: err.message });
      console.error('Error fetching boxes:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBoxes();
    fetchWarehouses(); // Fetch warehouses for the modal
  }, [fetchBoxes, fetchWarehouses]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenModal = (box: EnrichedBox | null = null) => {
    setBoxToEdit(box);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBoxToEdit(null);
    fetchBoxes(searchTerm); // Refresh boxes after modal closes
  };

  const handleDeleteBox = async () => {
    if (!boxToDelete) return;

    try {
      const response = await fetch(`/api/boxes/${boxToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete box');
      }
      toast.success(`Box "${boxToDelete.name}" deleted successfully!`);
      setBoxToDelete(null);
      fetchBoxes(searchTerm);
    } catch (err: any) {
      toast.error('Error deleting box', { description: err.message });
      console.error('Error deleting box:', err);
      setBoxToDelete(null); // Clear even on error
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">Error loading boxes: {error}</div>;
  }

  const filteredBoxes = boxes.filter(box => 
    box.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (box.warehouseName && box.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Box Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Box
        </Button>
      </div>

      <div className="mb-4 flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search boxes by name or warehouse..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading boxes...</p>
        </div>
      ) : filteredBoxes.length === 0 && !searchTerm ? (
        <div className="text-center py-12">
          <BoxIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No boxes found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click "Add New Box" to get started.</p>
        </div>
      ) : filteredBoxes.length === 0 && searchTerm ? (
         <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No boxes match "{searchTerm}"</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search term or clear the search.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="hidden md:table-cell">QR Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBoxes.map((box) => (
                <TableRow key={box.id}>
                  <TableCell className="font-medium">{box.name}</TableCell>
                  <TableCell>{box.warehouseName}</TableCell>
                  <TableCell className="hidden md:table-cell">{box.qrCodeUrl || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-2 justify-end">
                      <Button variant="outline" size="icon" title="Edit Box" onClick={() => handleOpenModal(box)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Delete Box" onClick={() => setBoxToDelete(box)}>
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
        <BoxFormModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          boxToEdit={boxToEdit} 
          warehouses={warehouses} // Pass warehouses to the modal
        />
      )}

      <AlertDialog open={!!boxToDelete} onOpenChange={(open) => !open && setBoxToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete "{boxToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the box.
                If items are in this box, deletion might be prevented.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBoxToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBox} className="bg-red-600 hover:bg-red-700">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-4 text-sm text-muted-foreground">
        Displaying {filteredBoxes.length} of {boxes.length} box(es).
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </p>
    </div>
  );
}
