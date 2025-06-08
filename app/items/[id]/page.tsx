// filepath: c:\\Users\\popco\\project\\shiba-lab-倉庫管理システムv2\\app\\items\\[id]\\page.tsx
'use client';

import { useEffect, useState, useCallback, useContext } from 'react'; // Added useContext
import { useParams, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext'; // Import AuthContext
import { Item, Rental, Role as UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2, QrCode as QrCodeIcon, ShoppingCart, RotateCcw } from 'lucide-react';
import ItemFormModal from '@/components/modals/ItemFormModal';
import RentalModal from '@/components/modals/RentalModal';
import QrCode from '@/components/common/QrCode';
import { UI_TEXTS_JP } from '@/constants';
import { DEFAULT_IMAGE_URL } from '@/constants';
import Image from 'next/image';
import { format } from 'date-fns';

interface ItemDetail extends Item {
  activeRentals: Rental[];
  warehouseName?: string;
}

export default function ItemDetailPage() {
  const { id: itemId } = useParams();
  const router = useRouter();
  const authContext = useContext(AuthContext); // Use useContext

  // Ensure authContext is not undefined before destructuring
  const user = authContext?.user;
  const authLoading = authContext?.loading;

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const fetchItemDetails = useCallback(async () => {
    if (!itemId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error(UI_TEXTS_JP.noItemsFound || 'Item not found.');
          router.push('/items');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch item details');
        }
        return;
      }
      const data = await response.json();
      setItem(data);
    } catch (error: any) {
      console.error('Fetch item error:', error);
      toast.error(error.message || UI_TEXTS_JP.error);
    } finally {
      setIsLoading(false);
    }
  }, [itemId, router]);

  useEffect(() => {
    // Wait for auth context to be loaded and user to be potentially available
    if (authContext && !authLoading) { 
        fetchItemDetails();
    }
  }, [itemId, authContext, authLoading, fetchItemDetails]);

  const handleDelete = async () => {
    if (!item) return;
    if (window.confirm(UI_TEXTS_JP.deleteItemConfirmation || 'Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/items/${item.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete item');
        }
        toast.success('Item deleted successfully');
        router.push('/items');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleReturn = async (rentalId: string) => {
    try {
      const response = await fetch(`/api/rentals/${rentalId}/return`, {
        method: 'PUT',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to return item');
      }
      toast.success(UI_TEXTS_JP.returnItem + ' ' + UI_TEXTS_JP.success);
      fetchItemDetails(); // Refresh item details to show updated rental status
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle loading state for auth and item data
  if (authLoading === undefined || authLoading || isLoading) { // Check if authLoading is undefined initially
    return <div className="flex justify-center items-center h-screen"><p>{UI_TEXTS_JP.loading}</p></div>;
  }

  if (!item) {
    return <div className="flex justify-center items-center h-screen"><p>{UI_TEXTS_JP.noItemsFound}</p></div>;
  }

  const isAdmin = user?.role === UserRole.ADMIN;
  const itemPublicUrl = typeof window !== 'undefined' ? `${window.location.origin}/items/${item.id}` : '';

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {UI_TEXTS_JP.back}
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{item.name}</CardTitle>
              {item.category && <Badge variant="secondary" className="mt-1">{item.category.name}</Badge>}
            </div>
            <div className="flex space-x-2">
              {isAdmin && (
                <>
                  <Button variant="outline" size="icon" onClick={() => setIsItemFormModalOpen(true)} title={UI_TEXTS_JP.editAction}>
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={handleDelete} title={UI_TEXTS_JP.deleteAction}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="icon" onClick={() => setIsQrModalOpen(true)} title={UI_TEXTS_JP.itemQRCode}>
                <QrCodeIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Image 
              src={item.imageUrl || DEFAULT_IMAGE_URL}
              alt={item.name}
              width={300}
              height={300}
              className="rounded-lg object-cover w-full aspect-square" 
              priority // Added priority for LCP image
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{UI_TEXTS_JP.description}</h3>
              <p className="text-muted-foreground">{item.description || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{UI_TEXTS_JP.quantity}</h3>
                <p>{item.quantity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{UI_TEXTS_JP.itemType}</h3>
                <p>{item.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{UI_TEXTS_JP.location}</h3>
                <p>{item.box?.name || 'N/A'} ({item.warehouseName || item.box?.warehouse?.name || UI_TEXTS_JP.unknownWarehouse})</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsRentalModalOpen(true)} 
              disabled={item.quantity <= 0 || (item.activeRentals && item.type === 'UNIQUE' && item.activeRentals.length >= item.quantity)}
              className="w-full md:w-auto"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> {UI_TEXTS_JP.lendAction}
            </Button>
          </div>
        </CardContent>
      </Card>

      {item.activeRentals && item.activeRentals.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{UI_TEXTS_JP.currentRentals}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {item.activeRentals.map((rental) => (
                <li key={rental.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-semibold">{rental.user?.name || 'Unknown User'} ({rental.quantity})</p>
                    <p className="text-sm text-muted-foreground">
                      {UI_TEXTS_JP.rentedAtLabel}: {format(new Date(rental.rentedAt), 'yyyy/MM/dd HH:mm')} - 
                      {UI_TEXTS_JP.dueDateLabel}: {format(new Date(rental.dueDate), 'yyyy/MM/dd')}
                    </p>
                  </div>
                  {(isAdmin || user?.id === rental.userId) && (
                    <Button variant="outline" size="sm" onClick={() => handleReturn(rental.id)}>
                      <RotateCcw className="mr-1 h-4 w-4" /> {UI_TEXTS_JP.returnAction}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {item.activeRentals && item.activeRentals.length === 0 && (
         <Card className="mb-6">
          <CardHeader>
            <CardTitle>{UI_TEXTS_JP.currentRentals}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{UI_TEXTS_JP.noCurrentRentals}</p>
          </CardContent>
        </Card>
      )}

      {isItemFormModalOpen && (
        <ItemFormModal
          isOpen={isItemFormModalOpen}
          onClose={() => {
            setIsItemFormModalOpen(false);
            fetchItemDetails(); // Refresh data on close
          }}
          itemToEdit={item}
        />
      )}

      {isRentalModalOpen && (
        <RentalModal
          isOpen={isRentalModalOpen}
          onClose={() => setIsRentalModalOpen(false)}
          item={item}
          onRentalSuccess={() => {
            fetchItemDetails(); // Refresh data on successful rental
            setIsRentalModalOpen(false);
          }}
        />
      )}

      {isQrModalOpen && itemPublicUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsQrModalOpen(false)}>
          <Card className="p-6 bg-white" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-center">{item.name} - {UI_TEXTS_JP.itemQRCode}</CardTitle>
              <CardDescription className="text-center">{UI_TEXTS_JP.itemQRCodeDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QrCode value={itemPublicUrl} size={256} />
              <p className="mt-2 text-sm text-muted-foreground break-all">{itemPublicUrl}</p>
              <Button variant="outline" onClick={() => setIsQrModalOpen(false)} className="mt-4">
                {UI_TEXTS_JP.closeButton}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
