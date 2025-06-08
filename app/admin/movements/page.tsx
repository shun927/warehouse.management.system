'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Changed from 'react-router-dom'
// import { mockFetchMovements } from '@/lib/api/mock'; // Assuming mock API is updated
import { Movement } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { UI_TEXTS_JP, ROUTE_PATHS } from '@/constants';
import { ArrowLeftIcon, InboxIcon } from '@heroicons/react/24/outline'; // TruckIcon not used
import { useAuth } from '@/hooks/useAuth'; // Standardized import path
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

const AllMovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const loadMovements = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return; // Guard for admin access
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const data = await mockFetchMovements();
      // setMovements(data);
      setMovements([]); // Temporarily set to empty array
      toast.info('Movement data is currently mocked/disabled.'); // Inform user
    } catch (err) {
      console.error("Failed to fetch movements:", err);
      setError(UI_TEXTS_JP.error);
      toast.error(UI_TEXTS_JP.errorFetchingMovements);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (hasMounted && !authLoading) {
      if (!user) {
        router.push(ROUTE_PATHS.LOGIN);
      } else if (user.role !== 'ADMIN') {
        toast.error(UI_TEXTS_JP.unauthorized);
        router.push(ROUTE_PATHS.DASHBOARD);
      } else {
        loadMovements();
      }
    }
  }, [hasMounted, user, authLoading, router, loadMovements]);

  const handleBack = () => {
    router.back();
  };

  if (!hasMounted || authLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-10 w-1/2 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-40" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user || user.role !== 'ADMIN') {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>{UI_TEXTS_JP.unauthorized}</p>
        <Button onClick={() => router.push(ROUTE_PATHS.LOGIN)} className="mt-4">
          {UI_TEXTS_JP.loginButton}
        </Button>
      </div>
    );
  }

  if (loading && movements.length === 0) { // Show skeleton only on initial load
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {UI_TEXTS_JP.back}
        </Button>
        <h1 className="text-2xl font-bold mb-6">{UI_TEXTS_JP.pageTitleMovements}</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-40" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500 p-4">{error}</p>
        <Button onClick={loadMovements} variant="outline">{UI_TEXTS_JP.retry}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="ghost" 
        onClick={handleBack} 
        className="mb-6 text-primary hover:text-primary/80 flex items-center px-0"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {UI_TEXTS_JP.back}
      </Button>
      
      <h1 className="text-2xl font-bold text-foreground mb-6">{UI_TEXTS_JP.pageTitleMovements}</h1>
      
      {movements.length === 0 && !loading ? (
        <Card className="text-center py-10">
          <CardContent>
            <InboxIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{UI_TEXTS_JP.noMovementsFound}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{(UI_TEXTS_JP as any).boxName}</TableHead>
                  <TableHead>{UI_TEXTS_JP.movedFrom}</TableHead>
                  <TableHead>{UI_TEXTS_JP.movedTo}</TableHead>
                  <TableHead>{UI_TEXTS_JP.movedAtLabel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <Link href={`${ROUTE_PATHS.BOXES}/${movement.boxId}`} className="text-primary hover:underline">
                        {movement.boxName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{movement.fromWarehouseName}</TableCell>
                    <TableCell className="text-muted-foreground">{movement.toWarehouseName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(movement.movedAt).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllMovementsPage;
