'use client';

import React, { useEffect, useState, useCallback } from 'react';
// Remove mock imports and useAuth if it's not adapted for App Router context
// import { useAuth } from '../../hooks/useAuth'; 
// import { fetchUserRentals, returnItem as apiReturnItem } from '../../services/api';
import { Rental, ItemType } from '../../types'; // Ensure ItemType is imported if used in RentalCard
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { UI_TEXTS_JP, DEFAULT_IMAGE_URL, ROUTE_PATHS } from '../../constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InboxIcon, CheckCircleIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Image from 'next/image';
import { format, parseISO, differenceInDays, isPast } from 'date-fns'; // For date operations
import { ja } from 'date-fns/locale'; // For Japanese date formatting

// Helper function to format date strings
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'PPP (E)', { locale: ja });
  } catch (e) {
    return 'Invalid Date';
  }
};

const getDueDateStatus = (dueDateString?: string | null): { text: string; color: string; daysRemaining: number | null } => {
  if (!dueDateString) return { text: '期限なし', color: 'text-gray-500', daysRemaining: null };
  const dueDate = parseISO(dueDateString);
  const today = new Date();
  const daysRemaining = differenceInDays(dueDate, today);

  if (isPast(dueDate) && daysRemaining < 0) {
    return { text: `${Math.abs(daysRemaining)}日超過`, color: 'text-red-500 font-semibold', daysRemaining };
  }
  if (daysRemaining === 0) {
    return { text: '本日返却期限', color: 'text-orange-500 font-semibold', daysRemaining };
  }
  if (daysRemaining <= 3) {
    return { text: `あと${daysRemaining}日`, color: 'text-yellow-500', daysRemaining };
  }
  return { text: `あと${daysRemaining}日`, color: 'text-green-500', daysRemaining };
};


export default function MyRentalsPage() {
  // const { user } = useAuth(); // Replaced with client-side session check or passed from server component
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [returnStatus, setReturnStatus] = useState<{[key: string]: 'returning' | 'success' | 'error'}>({});
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const loadRentals = useCallback(async () => {
    // No need to check for user here, API route will handle auth
    if (hasMounted) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/rentals/me'); // Use the new API endpoint
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch rentals');
        }
        const data = await response.json();
        setRentals(data);
      } catch (err: any) {
        console.error("Failed to fetch user rentals:", err);
        setError(err.message || UI_TEXTS_JP.error);
        toast.error(err.message || UI_TEXTS_JP.errorFetchingRentals);
      } finally {
        setLoading(false);
      }
    }
  }, [hasMounted]);

  useEffect(() => {
    if (hasMounted) {
        loadRentals();
    }
  }, [loadRentals]); // Removed hasMounted from dependency array as loadRentals depends on it

  const handleReturnItem = async (rentalId: string, itemName: string) => {
    setReturnStatus(prev => ({...prev, [rentalId]: 'returning'}));
    try {
      const response = await fetch(`/api/rentals/${rentalId}/return`, { method: 'PUT' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to return item');
      }
      // const returnedRental = await response.json(); // Optional: use returned data
      toast(UI_TEXTS_JP.itemReturnSuccess); // Changed: Pass message directly
      setReturnStatus(prev => ({...prev, [rentalId]: 'success'}));
      setTimeout(() => {
        loadRentals(); // Refresh list
        setReturnStatus(prev => {
            const newStatus = {...prev};
            delete newStatus[rentalId];
            return newStatus;
        });
      }, 1500); 
    } catch (err: any) {
      console.error("Failed to return item:", err);
      toast.error(UI_TEXTS_JP.itemReturnError); // Removed variant property
      setReturnStatus(prev => ({...prev, [rentalId]: 'error'}));
    }
  };

  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (loading && rentals.length === 0 && hasMounted) { // Added hasMounted to prevent premature loading state display
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div role="status" className="flex flex-col items-center">
            <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <p className="mt-2 text-sm text-gray-500">{UI_TEXTS_JP.loadingRentals}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center p-4">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-primary hover:text-primary/80 flex items-center">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {UI_TEXTS_JP.back}
      </Button>
      <h1 className="text-2xl font-bold mb-6">{UI_TEXTS_JP.myRentals}</h1>
      
      {loading && rentals.length > 0 && (
         <div className="flex justify-center items-center py-4">
            <div role="status" className="flex items-center space-x-2">
                <svg aria-hidden="true" className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                </svg>
                <span className="text-sm text-muted-foreground">{UI_TEXTS_JP.loadingRentals}</span>
            </div>
         </div>
      )}

      {!loading && rentals.length === 0 && hasMounted ? ( // Added hasMounted
        <Card className="text-center py-10">
          <CardHeader>
            <InboxIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle>{UI_TEXTS_JP.noRentalsFound}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{UI_TEXTS_JP.noActiveRentalsMessage}</p>
            <Button asChild>
              <Link href={ROUTE_PATHS.ITEMS}>{UI_TEXTS_JP.browseItemsToRent}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => {
            const dueDateStatus = getDueDateStatus(rental.dueDate);
            const isReturnable = rental.item.type !== ItemType.CONSUMABLE;
            return (
              <Card key={rental.id} className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${returnStatus[rental.id] === 'success' ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <Link href={`${ROUTE_PATHS.ITEMS}/${rental.item.id}`} className="hover:underline">
                        <CardTitle className="text-xl font-semibold text-primary">
                            {rental.item.name}
                        </CardTitle>
                    </Link>
                    {rental.item.type === ItemType.CONSUMABLE && (
                        <Badge variant="outline" className="ml-2">{UI_TEXTS_JP.itemTypeConsumable}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {UI_TEXTS_JP.rentalQuantity}: {rental.quantity}
                  </p>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 items-start">
                  <div className="md:col-span-1 flex justify-center md:justify-start">
                    <Image 
                        src={rental.item.imageUrl || DEFAULT_IMAGE_URL}
                        alt={rental.item.name}
                        width={128} 
                        height={128}
                        className="rounded-md object-cover aspect-square"
                        onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE_URL)} // Fallback for broken images
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-sm">
                        <span className="font-semibold">{UI_TEXTS_JP.rentalDate}:</span> {formatDate(rental.rentedAt)}
                    </p>
                    <p className={`text-sm ${dueDateStatus.color}`}>
                        <span className="font-semibold">{UI_TEXTS_JP.dueDateLabel}:</span> {formatDate(rental.dueDate)} ({dueDateStatus.text})
                    </p>
                    {rental.item.box && (
                        <p className="text-sm text-muted-foreground">
                            {UI_TEXTS_JP.originalLocation}: {rental.item.box.name} ({rental.item.box.warehouse?.name})
                        </p>
                    )}
                    {rental.item.category && (
                        <p className="text-sm text-muted-foreground">
                            {UI_TEXTS_JP.category}: {rental.item.category.name}
                        </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-4">
                  {returnStatus[rental.id] === 'returning' ? (
                    <Button disabled className="w-full sm:w-auto">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {UI_TEXTS_JP.returningProcess}
                    </Button>
                  ) : returnStatus[rental.id] === 'success' ? (
                    <div className="flex items-center text-green-600">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        {UI_TEXTS_JP.returnCompleted}
                    </div>
                  ) : (
                    isReturnable ? (
                        <Button 
                            onClick={() => handleReturnItem(rental.id, rental.item.name)}
                            className="w-full sm:w-auto"
                            variant={rental.dueDate && isPast(parseISO(rental.dueDate)) ? "destructive" : "default"} // Check rental.dueDate before parsing
                        >
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            {UI_TEXTS_JP.returnItemButton}
                        </Button>
                    ) : (
                        <Badge variant="secondary">{UI_TEXTS_JP.noReturnNeeded}</Badge>
                    )
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
