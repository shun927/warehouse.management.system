// app/locations/[boxId]/move/page.tsx
import { notFound } from 'next/navigation';
import BoxMoveForm from '@/components/locations/BoxMoveForm'; // Client component for the form
import { Separator } from '@/components/ui/separator'; // Corrected import path
import prisma from '@/lib/prisma'; // Import shared Prisma client

async function getBoxDetails(boxId: string) {
  const box = await prisma.box.findUnique({
    where: { id: boxId },
    include: {
      warehouse: true, // Include current warehouse details
    },
  });
  return box;
}

async function getAllWarehouses() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  return warehouses;
}

interface BoxMovePageProps {
  params: any; // Simplified params type
};

export default async function BoxMovePage({ params }: BoxMovePageProps) {
  const { boxId } = params;
  const box = await getBoxDetails(boxId);
  const warehouses = await getAllWarehouses();

  if (!box) {
    notFound(); // Triggers 404 page if box not found
  }

  // Filter out the current warehouse from the list of target warehouses
  const targetWarehouses = warehouses.filter(wh => wh.id !== box.warehouseId);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Move Box: <span className="text-blue-600 dark:text-blue-400">{box.name}</span>
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Currently in: <strong>{box.warehouse.name}</strong>
        </p>
      </div>
      <Separator className="my-6" />
      
      {targetWarehouses.length === 0 ? (
         <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400">No other warehouses available to move this box to.</p>
            {/* Optionally, add a link to create a new warehouse if applicable */}
        </div>
      ) : (
        <BoxMoveForm box={box} warehouses={targetWarehouses} />
      )}
    </div>
  );
}
