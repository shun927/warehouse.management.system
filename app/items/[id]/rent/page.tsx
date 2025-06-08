'use client';

import { useEffect, useState, useCallback, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { Item, Role as UserRole } from '@/types';
import { Button } from '@/components/ui/button'; // Added
import RentalModal from '@/components/modals/RentalModal';
import { toast } from 'sonner';
import { UI_TEXTS_JP } from '@/constants';
import { Skeleton } from '@/components/ui/skeleton';

export default function ItemRentPage() {
  const { id: itemId } = useParams();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const authLoading = authContext?.loading;

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  const fetchItemDetails = useCallback(async () => {
    if (!itemId) {
      toast.error('Invalid item ID.');
      router.push('/items');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error(UI_TEXTS_JP.noItemsFound || 'Item not found.');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to fetch item details');
        }
        router.push('/items');
        return;
      }
      const data = await response.json();
      setItem(data);
      setIsRentalModalOpen(true); // Open modal once item data is fetched
    } catch (error: any) {
      console.error('Fetch item error for rental:', error);
      toast.error(error.message || UI_TEXTS_JP.error);
      router.push('/items');
    } finally {
      setIsLoading(false);
    }
  }, [itemId, router]);

  useEffect(() => {
    if (authContext && !authLoading) {
      if (user) {
        fetchItemDetails();
      } else {
        // If user is not authenticated, redirect to login, then they might be redirected back.
        toast.info('Please login to rent items.');
        router.push(`/login?redirect=/items/${itemId}/rent`);
      }
    }
  }, [itemId, authContext, authLoading, user, fetchItemDetails, router]);

  const handleModalClose = () => {
    setIsRentalModalOpen(false);
    // Redirect to item detail page or item list after modal is closed
    router.push(item ? `/items/${item.id}` : '/items');
  };

  const handleRentalSuccess = () => {
    setIsRentalModalOpen(false);
    toast.success(UI_TEXTS_JP.lendItem + ' ' + UI_TEXTS_JP.success);
    router.push('/my-rentals'); // Redirect to my rentals page after successful rental
  };

  if (isLoading || authLoading || (authContext && !user && !authLoading) ) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-32 w-full" />
        <p className="mt-4 text-lg">{UI_TEXTS_JP.loading}</p>
      </div>
    );
  }

  if (!item) {
    // This case should ideally be handled by redirects in fetchItemDetails
    // but as a fallback:
    return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
            <p className="text-lg text-red-600">{UI_TEXTS_JP.noItemsFound}</p>
            <Button onClick={() => router.push('/items')} className="mt-4">{UI_TEXTS_JP.back} to Items</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* 
        This page itself won't render much visible UI other than the modal.
        It acts as a controller to fetch item data and display the RentalModal.
        A loading state or minimal message can be shown while data is fetched.
      */}
      {item && (
        <RentalModal
          isOpen={isRentalModalOpen}
          onClose={handleModalClose}
          item={item}
          onRentalSuccess={handleRentalSuccess}
        />
      )}
      {!isRentalModalOpen && !isLoading && (
        // Fallback content if modal is not open for some reason after loading
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p>Redirecting...</p> 
        </div>
      )}
    </div>
  );
}
