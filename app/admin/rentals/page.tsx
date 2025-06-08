'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Rental, Item, User, ItemType, Role } from '@/types'; // Adjusted path, Added ItemType and Role
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { UI_TEXTS_JP, ROUTE_PATHS, DEFAULT_IMAGE_URL } from '@/constants';
import { ArrowLeftIcon, InboxIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth'; // Adjusted path
import { toast } from 'sonner';

// Mock data structure for a Rental that includes nested Item and User
interface MockRental extends Omit<Rental, 'item' | 'user'> {
  item: Item;
  user: User;
  createdAt: string; // Added
  updatedAt: string; // Added
}

// Mock API call - Replace with actual API call later
const mockFetchAllRentals = async (): Promise<MockRental[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Sample data closely matching the expected structure
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'rental-1',
      itemId: 'item-101',
      userId: 'user-alpha',
      quantity: 1,
      rentedAt: sevenDaysAgo.toISOString(),
      dueDate: threeDaysAgo.toISOString(), // Overdue
      returnedAt: null,
      createdAt: sevenDaysAgo.toISOString(), // Added
      updatedAt: sevenDaysAgo.toISOString(), // Added
      item: {
        id: 'item-101',
        name: '高精度テスター',
        description: '多機能デジタルマルチメーター',
        imageUrl: '/images/placeholder-tool.jpg',
        quantity: 1, // Stock quantity, not rental quantity
        type: ItemType.UNIQUE, // Changed to enum
        qrCodeUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      user: {
        id: 'user-alpha',
        name: '利用者A',
        email: 'user.a@example.com',
        role: Role.MEMBER, // Changed to enum
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), // Added
      }
    },
    {
      id: 'rental-2',
      itemId: 'item-102',
      userId: 'user-beta',
      quantity: 5,
      rentedAt: threeDaysAgo.toISOString(),
      dueDate: fiveDaysFromNow.toISOString(), // Not overdue
      returnedAt: null,
      createdAt: threeDaysAgo.toISOString(), // Added
      updatedAt: threeDaysAgo.toISOString(), // Added
      item: {
        id: 'item-102',
        name: '六角レンチセット',
        description: '各種サイズ対応',
        imageUrl: null, // Test default image
        quantity: 10,
        type: ItemType.COUNTABLE, // Changed to enum
        qrCodeUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      user: {
        id: 'user-beta',
        name: '利用者B',
        email: 'user.b@example.com',
        role: Role.MEMBER, // Changed to enum
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), // Added
      }
    },
    {
      id: 'rental-3',
      itemId: 'item-103',
      userId: 'user-gamma',
      quantity: 1,
      rentedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      returnedAt: twoDaysAgo.toISOString(), // Returned
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Added
      updatedAt: twoDaysAgo.toISOString(), // Added (or now, depending on logic)
      item: {
        id: 'item-103',
        name: 'オシロスコープ',
        description: '高性能デジタルオシロスコープ',
        imageUrl: '/images/placeholder-measurement.jpg',
        quantity: 1,
        type: ItemType.UNIQUE, // Changed to enum
        qrCodeUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      user: {
        id: 'user-gamma',
        name: '利用者C',
        email: 'user.c@example.com',
        role: Role.ADMIN, // Changed to enum
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), // Added
      }
    },
  ].sort((a, b) => new Date(b.rentedAt).getTime() - new Date(a.rentedAt).getTime()); // Sort by rentedAt desc
};

export default function AllRentalsPage() {
  const [rentals, setRentals] = useState<MockRental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAdmin } = useAuth(); // Assuming this hook provides admin status
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const loadRentals = useCallback(async () => {
    if (!hasMounted || !isAdmin) return; // Only load if mounted and user is admin
    setLoading(true);
    setError(null);
    try {
      const data = await mockFetchAllRentals(); // Replace with actual API call
      setRentals(data);
    } catch (err) {
      console.error("Failed to fetch all rentals:", err);
      setError(UI_TEXTS_JP.errorFetchingRentals);
      toast.error(UI_TEXTS_JP.errorFetchingRentals);
    } finally {
      setLoading(false);
    }
  }, [hasMounted, isAdmin]);

  useEffect(() => {
    if (hasMounted && isAdmin) {
      loadRentals();
    } else if (hasMounted && !isAdmin) {
        setError(UI_TEXTS_JP.errorUnauthorized);
        setLoading(false);
        toast.error(UI_TEXTS_JP.errorUnauthorizedAccess);
        // Optionally redirect non-admins
        // router.push(ROUTE_PATHS.DASHBOARD);
    }
  }, [loadRentals, hasMounted, isAdmin, router]);

  const getStatus = (rental: MockRental): { text: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: JSX.Element } => {
    if (rental.returnedAt) {
      return { text: UI_TEXTS_JP.statusReturned, variant: 'default', icon: <CheckCircleIcon className="h-4 w-4 mr-1.5 text-green-500" /> };
    }
    if (rental.dueDate) {
        const dueDate = new Date(rental.dueDate);
        const now = new Date();
        if (dueDate < now) {
            return { text: `${UI_TEXTS_JP.statusRented} (${UI_TEXTS_JP.overdue})`, variant: 'destructive', icon: <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" /> };
        }
    }
    return { text: UI_TEXTS_JP.statusRented, variant: 'secondary', icon: <ClockIcon className="h-4 w-4 mr-1.5" /> };
  };

  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (loading && rentals.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div role="status" className="flex flex-col items-center">
            <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <p className="mt-2 text-sm text-gray-500">{UI_TEXTS_JP.loadingRentals}</p>
        </div>
      </div>
    );
  }

  if (error && !isAdmin) { // Show unauthorized error prominently for non-admins
    return (
        <div className="container mx-auto p-4 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-semibold text-destructive">{UI_TEXTS_JP.errorUnauthorized}</h1>
            <p className="text-muted-foreground">{UI_TEXTS_JP.errorUnauthorizedAccess}</p>
            <Button onClick={() => router.push(ROUTE_PATHS.DASHBOARD)} className="mt-6">
                {UI_TEXTS_JP.goToDashboard}
            </Button>
        </div>
    );
  }

  if (error && rentals.length === 0) { // General error when fetching
    return <p className="text-destructive text-center p-4">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-primary hover:text-primary/80 flex items-center">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {UI_TEXTS_JP.back}
      </Button>
      
      <div className="flex items-center mb-6">
        <ListBulletIcon className="h-7 w-7 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">{UI_TEXTS_JP.pageTitleAllRentals}</h1>
      </div>
      
      {!isAdmin && !loading && (
        <Card className="text-center py-10">
            <CardHeader>
                <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-destructive mb-4" />
                <CardTitle className="text-xl font-semibold text-destructive">{UI_TEXTS_JP.errorUnauthorized}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{UI_TEXTS_JP.errorUnauthorizedAccess}</p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button onClick={() => router.push(ROUTE_PATHS.DASHBOARD)} className="mt-4">
                    {UI_TEXTS_JP.goToDashboard}
                </Button>
            </CardFooter>
        </Card>
      )}

      {isAdmin && rentals.length === 0 && !loading && (
        <Card className="text-center py-10">
            <CardHeader>
                <InboxIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>{UI_TEXTS_JP.noRentalsFoundSystemWide}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{UI_TEXTS_JP.noRentalsYetSystem}</p>
            </CardContent>
        </Card>
      )}
      
      {isAdmin && rentals.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{UI_TEXTS_JP.itemName}</TableHead>
                <TableHead>{UI_TEXTS_JP.borrower}</TableHead>
                <TableHead className="text-center">{UI_TEXTS_JP.quantity}</TableHead>
                <TableHead>{UI_TEXTS_JP.rentalDate}</TableHead>
                <TableHead>{UI_TEXTS_JP.dueDate}</TableHead>
                <TableHead>{UI_TEXTS_JP.returnDate}</TableHead>
                <TableHead>{UI_TEXTS_JP.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => {
                const statusInfo = getStatus(rental);
                const itemImage = rental.item?.imageUrl || DEFAULT_IMAGE_URL;
                const itemName = rental.item?.name || UI_TEXTS_JP.unknownItem;
                const userName = rental.user?.name || UI_TEXTS_JP.unknownUser;

                return (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="relative h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                            <Image 
                                src={itemImage} 
                                alt={itemName} 
                                layout="fill"
                                objectFit="cover"
                                onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    if (target.src !== DEFAULT_IMAGE_URL) {
                                        target.src = DEFAULT_IMAGE_URL;
                                    }
                                }}
                            />
                        </div>
                        <Link 
                            href={`${ROUTE_PATHS.ITEMS}/${rental.itemId}`} 
                            className="ml-3 font-medium text-primary hover:underline truncate"
                            title={itemName}
                        >
                          {itemName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="font-medium">{userName}</div>
                        <div className="text-xs text-muted-foreground">{rental.user?.email}</div>
                    </TableCell>
                    <TableCell className="text-center">{rental.quantity}</TableCell>
                    <TableCell>{new Date(rental.rentedAt).toLocaleDateString('ja-JP')}</TableCell>
                    <TableCell>
                      {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString('ja-JP') : UI_TEXTS_JP.notSet}
                    </TableCell>
                    <TableCell>
                      {rental.returnedAt ? new Date(rental.returnedAt).toLocaleDateString('ja-JP') : UI_TEXTS_JP.notReturnedYet}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className={`text-xs ${statusInfo.variant === 'default' ? 'bg-green-100 text-green-700 border-green-300' : ''}`}>
                        {React.cloneElement(statusInfo.icon, { className: `h-3.5 w-3.5 mr-1 ${statusInfo.variant === 'destructive' ? 'text-destructive-foreground' : statusInfo.variant === 'default' ? 'text-green-600' : ''}` })}
                        {statusInfo.text}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
