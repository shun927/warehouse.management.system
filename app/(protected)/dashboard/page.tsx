import React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface OverdueRental {
  id: string;
  itemId: string;
  quantity: number;
  rentedAt: string;
  dueDate: string;
  item: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
}

async function getDashboardData() {
  const supabase = await createSupabaseServerClient(); // Added await here
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch overdue rentals from the new API route
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard`, {
    headers: {
      cookie: (await (await createSupabaseServerClient()).auth.getSession()).data.session?.access_token ? `sb-access-token=${(await (await createSupabaseServerClient()).auth.getSession()).data.session?.access_token}` : '' // Added await here as well
    }
  });
  if (!res.ok) {
    // Handle error appropriately
    console.error("Failed to fetch dashboard data", await res.text());
    return { user, overdueRentals: [], error: "Failed to load overdue items." };
  }
  const overdueRentals: OverdueRental[] = await res.json();

  return { user, overdueRentals };
}

export default async function DashboardPage() {
  const { user, overdueRentals, error } = await getDashboardData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.email}!</CardTitle>
          <CardDescription>This is your Shiba Lab Warehouse Management dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You can manage items, track rentals, and oversee warehouse locations from here.</p>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {overdueRentals && overdueRentals.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <AlertTriangle className="mr-2 h-5 w-5" /> Overdue Items
            </CardTitle>
            <CardDescription>
              You have items that are past their due date. Please return them as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {overdueRentals.map((rental) => (
                <li key={rental.id} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{rental.item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Rented on: {new Date(rental.rentedAt).toLocaleDateString()} - 
                        <span className="font-bold text-red-600"> Due by: {new Date(rental.dueDate).toLocaleDateString()}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">Quantity: {rental.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {rental.item.imageUrl && (
                        <img src={rental.item.imageUrl} alt={rental.item.name} className="h-16 w-16 object-cover rounded" />
                      )}
                       <Link href={`/my-rentals?highlight=${rental.id}`} passHref>
                        <Button variant="outline" size="sm">View & Return</Button>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {overdueRentals && overdueRentals.length === 0 && !error && (
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5 text-blue-500" /> No Overdue Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You have no overdue items. Well done!</p>
             <Link href="/my-rentals" passHref>
                <Button variant="link" className="mt-2 px-0">View your active rentals</Button>
              </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Link href="/items/new" passHref><Button variant="outline">Add New Item</Button></Link>
            <Link href="/scan" passHref><Button variant="outline">Scan QR Code</Button></Link>
            <Link href="/locations" passHref><Button variant="outline">View Locations</Button></Link>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
