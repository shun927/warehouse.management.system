import { Box as AppBox } from '@/types';
import QrCode from '@/components/common/QrCode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function BoxDetailPage({ params }: { params: any }) {
  const id = params.id;

  // Fetch data directly using Prisma
  const box = await prisma.box.findUnique({
    where: { id: id },
    include: {
      warehouse: true,
      items: {
        include: {
          category: true, // Assuming items might have categories displayed or typed
        },
        orderBy: { // Optional: order items if needed
          name: 'asc',
        }
      },
      movements: {
        include: {
          fromWarehouse: true,
          toWarehouse: true,
        },
        orderBy: {
          movedAt: 'desc',
        },
      },
    },
  });

  if (!box) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/boxes"> {/* Changed link from /admin/boxes to /boxes */}
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Boxes
        </Link>
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Box Details: {box.name || `Box ID: ${box.id}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>ID:</strong> {box.id}</p>
          <p><strong>Name:</strong> {box.name || 'N/A'}</p>
          <p><strong>Current Warehouse:</strong> <Link href={`/locations`} className="text-blue-500 hover:underline">{box.warehouse?.name || 'N/A'}</Link></p>
          <p><strong>QR Code URL:</strong> {box.qrCodeUrl ? <Link href={box.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View QR</Link> : 'Not generated'}</p>
          {/* Ensure box.updatedAt and box.createdAt are valid Date objects or strings that can be parsed by new Date() */}
          <p><strong>Last Updated:</strong> {format(new Date(box.updatedAt), 'PPP p')}</p>
          <p><strong>Created At:</strong> {format(new Date(box.createdAt), 'PPP p')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Items in Box</CardTitle>
        </CardHeader>
        <CardContent>
          {box.items && box.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  {/* Added Category column as it's fetched, can be removed if not needed */}
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {box.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell><Badge variant={item.type === 'UNIQUE' ? 'default' : 'secondary'}>{item.type}</Badge></TableCell>
                    {/* Display item category */}
                    <TableCell>{item.category?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Link href={`/items/${item.id}`} className="text-blue-500 hover:underline">
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No items in this box.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          {box.movements && box.movements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From Warehouse</TableHead>
                  <TableHead>To Warehouse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {box.movements.map((movement) => (
                  <TableRow key={movement.id}>
                    {/* Ensure movement.movedAt is a valid Date object or string */}
                    <TableCell>{format(new Date(movement.movedAt), 'PPP p')}</TableCell>
                    <TableCell>{movement.fromWarehouse?.name || 'N/A'}</TableCell>
                    <TableCell>{movement.toWarehouse?.name || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No movement history for this box.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
