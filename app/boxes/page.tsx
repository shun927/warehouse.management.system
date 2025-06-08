'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UI_TEXTS_JP, ROUTE_PATHS } from '@/constants';
import { ArchiveBoxIcon, MapPinIcon, InboxIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth'; // Standardized import path
import { Skeleton } from '@/components/ui/skeleton';

const BoxesPage: React.FC = () => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const loadBoxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with actual API call
      const response = await fetch('/api/boxes'); // Changed from mockFetchBoxes
      if (!response.ok) {
        // It's good practice to await the text() or json() of the response to get more details
        const errorText = await response.text();
        console.error("Error response from /api/boxes:", response.status, errorText);
        throw new Error(UI_TEXTS_JP.errorFetchingBoxes);
      }
      const data = await response.json();
      setBoxes(data);
    } catch (err) {
      console.error("Failed to fetch boxes:", err);
      const errorMessage = err instanceof Error && err.message ? err.message : UI_TEXTS_JP.error;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // Removed UI_TEXTS_JP constants from dependencies as they don't change

  useEffect(() => {
    if (hasMounted && !authLoading) {
      if (!user) {
        router.push(ROUTE_PATHS.LOGIN);
      } else {
        loadBoxes();
      }
    }
  }, [hasMounted, user, authLoading, router, loadBoxes]);

  const handleBack = () => {
    router.back();
  };

  if (!hasMounted || authLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Skeleton className="h-10 w-1/2" />
          {isAdmin && <Skeleton className="h-10 w-36" />}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
     // This case should ideally be handled by the useEffect redirect
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>{UI_TEXTS_JP.unauthorized}</p>
        <Button onClick={() => router.push(ROUTE_PATHS.LOGIN)} className="mt-4">
          {UI_TEXTS_JP.loginButton}
        </Button>
      </div>
    );
  }

  if (loading && boxes.length === 0) {
    return (
      <div className="container mx-auto p-4">
         <Button variant="ghost" onClick={handleBack} className="mb-6 text-primary hover:text-primary/80 flex items-center px-0">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {UI_TEXTS_JP.back}
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">{UI_TEXTS_JP.pageTitleBoxes}</h1>
          {isAdmin && (
            <Link href={ROUTE_PATHS.BOX_NEW} passHref>
              <Button className="flex items-center justify-center w-full sm:w-auto">
                <PlusIcon className="h-5 w-5 mr-2" /> {UI_TEXTS_JP.addNewBox}
              </Button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500 p-4">{error}</p>
        <Button onClick={loadBoxes} variant="outline">{UI_TEXTS_JP.retry}</Button>
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-foreground">{UI_TEXTS_JP.pageTitleBoxes}</h1>
        {isAdmin && (
          <Link href={ROUTE_PATHS.BOX_NEW} passHref>
            <Button className="flex items-center justify-center w-full sm:w-auto">
              <PlusIcon className="h-5 w-5 mr-2" /> {UI_TEXTS_JP.addNewBox}
            </Button>
          </Link>
        )}
      </div>

      {boxes.length === 0 && !loading ? (
        <Card className="text-center py-10">
          <CardContent>
            <InboxIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{UI_TEXTS_JP.noBoxesFound}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boxes.map((box) => (
            <Link 
              key={box.id} 
              href={`${ROUTE_PATHS.BOXES}/${box.id}`} 
              passHref
              className="block group"
            >
              <Card className="overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col h-full">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center mb-1">
                    <ArchiveBoxIcon className="h-7 w-7 mr-3 text-primary group-hover:text-primary/90 transition-colors" />
                    <CardTitle className="text-lg font-semibold truncate group-hover:text-primary/90 transition-colors" title={box.name}>
                      {box.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow space-y-1 text-sm text-muted-foreground">
                  {box.warehouse && (
                    <p className="text-sm text-muted-foreground">
                      {UI_TEXTS_JP.warehouse}: {box.warehouse.name}
                    </p>
                  )}
                  <p className="flex items-center">
                    <InboxIcon className="h-4 w-4 mr-2 text-muted-foreground/800" />
                    {UI_TEXTS_JP.itemCount}: {box.items?.length || 0}
                  </p>
                </CardContent>
                <div className="p-4 pt-2 mt-auto text-right">
                  <span className="text-sm text-primary group-hover:text-primary/80 font-medium transition-colors">
                    {UI_TEXTS_JP.viewContents} &rarr;
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoxesPage;
