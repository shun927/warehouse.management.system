'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Search, Eye, Package, ShoppingCart } from 'lucide-react'; // Added ShoppingCart icon
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // Assuming this path is correct for shadcn/ui table
import { Badge } from '@/components/ui/badge';
import { Item, ItemType } from '@/types';
import { toast } from 'sonner';
import ItemFormModal from '@/components/modals/ItemFormModal'; // Import the modal
import RentalModal from '@/components/modals/RentalModal'; // Import RentalModal

interface EnrichedItem extends Item {
  categoryName?: string;
  boxName?: string;
}

export default function ItemsPage() {
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [itemToRent, setItemToRent] = useState<Item | null>(null);

  const fetchItems = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/items${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }
      const data = await response.json();
      const enrichedData = data.map((item: any) => ({
        ...item,
        categoryName: item.category?.name,
        boxName: item.box?.name,
      }));
      setItems(enrichedData);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error fetching items', { description: err.message });
      console.error('Error fetching items:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems(searchTerm);
  }, [fetchItems, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenItemFormModal = (item: Item | null = null) => {
    setItemToEdit(item); // Set item to edit, or null for new item
    setIsItemFormModalOpen(true);
  };

  const handleCloseItemFormModal = () => {
    setIsItemFormModalOpen(false);
    setItemToEdit(null); // Clear item to edit
    fetchItems(searchTerm); // Refresh items after modal closes
  };

  const handleOpenRentalModal = (item: Item) => {
    setItemToRent(item);
    setIsRentalModalOpen(true);
  };

  const handleCloseRentalModal = () => {
    setIsRentalModalOpen(false);
    setItemToRent(null);
  };

  const handleRentalSuccess = () => {
    fetchItems(searchTerm); // Refresh items list
    // Optionally, could show a success message here if not handled by RentalModal itself
  };

  if (error) {
    return <div className="text-red-500">Error loading items: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Items Management</h1>
        <Button onClick={() => handleOpenItemFormModal()}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
        </Button>
      </div>

      <div className="mb-4 flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items by name or description..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      ) : items.length === 0 && !searchTerm ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No items found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click "Add New Item" to get started.</p>
        </div>
      ) : items.length === 0 && searchTerm ? (
         <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No items match "{searchTerm}"</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search term or clear the search.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Box</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell truncate max-w-xs">
                    {item.description || 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === ItemType.UNIQUE ? 'default' : item.type === ItemType.COUNTABLE ? 'secondary' : 'outline'}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{item.categoryName || 'N/A'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{item.boxName || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-2 justify-end">
                      <Button variant="outline" size="icon" asChild title="View Details">
                        <Link href={`/items/${item.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" title="Edit Item" onClick={() => handleOpenItemFormModal(item as Item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        title="Rent Item" 
                        onClick={() => handleOpenRentalModal(item as Item)}
                        disabled={item.quantity === 0 && item.type !== ItemType.UNIQUE}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isItemFormModalOpen && (
        <ItemFormModal 
          isOpen={isItemFormModalOpen} 
          onClose={handleCloseItemFormModal} 
          itemToEdit={itemToEdit} 
          // categories={[]} // Pass actual categories if fetched
          // boxes={[]} // Pass actual boxes if fetched
        />
      )}

      {isRentalModalOpen && itemToRent && (
        <RentalModal
          isOpen={isRentalModalOpen}
          onClose={handleCloseRentalModal}
          item={itemToRent}
          onRentalSuccess={handleRentalSuccess}
        />
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        Displaying {items.length} item(s).
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </p>
    </div>
  );
}
