// app/locations/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import prisma from '@/lib/prisma'; // Import shared Prisma client
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Added
import { Role } from '@/types'; // Added
import { PlusCircleIcon, PencilIcon } from 'lucide-react'; // Added

async function getWarehousesWithBoxes() {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      boxes: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
  return warehouses;
}

export default async function LocationsPage() {
  const warehouses = await getWarehousesWithBoxes();

  const supabaseClient = await createSupabaseServerClient(); // Wait for the client to be created
  const { data: { user: supabaseUser } } = await supabaseClient.auth.getUser();
  let userRole: Role | null = null;

  if (supabaseUser) {
    const userProfile = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      select: { role: true },
    });
    userRole = userProfile?.role as Role | null;
  }

  const isAdmin = userRole === Role.ADMIN;

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Warehouses & Boxes
        </h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/warehouses/new"> {/* Tentative path for new warehouse */}
              <PlusCircleIcon className="mr-2 h-5 w-5" /> Create New Warehouse
            </Link>
          </Button>
        )}
      </div>

      {warehouses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 dark:text-gray-400">No warehouses found.</p>
          {isAdmin && (
            <Button asChild className="mt-4">
              <Link href="/admin/warehouses/new">
                <PlusCircleIcon className="mr-2 h-5 w-5" /> Create New Warehouse
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    {warehouse.name}
                  </CardTitle>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/warehouses/${warehouse.id}/edit`}> {/* Tentative path */}
                          <PencilIcon className="mr-1 h-4 w-4" /> Edit Warehouse
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {warehouse.boxes.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 py-4">
                    No boxes currently in this warehouse.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {warehouse.boxes.map((box) => (
                      <div key={box.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{box.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {box.id}</p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex-shrink-0 flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/boxes/${box.id}`}>View Details</Link>
                          </Button>
                          <Button variant="default" size="sm" asChild>
                            <Link href={`/locations/${box.id}/move`}>Move Box</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isAdmin && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" size="sm" asChild>
                       <Link href={`/admin/boxes/new?warehouseId=${warehouse.id}`}> {/* Tentative path */}
                         <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New Box to this Warehouse
                       </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Consider adding revalidate if data changes frequently and needs to be fresh
// export const revalidate = 60; // e.g., revalidate every 60 seconds
