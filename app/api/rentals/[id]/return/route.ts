import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ItemType as PrismaItemType, Role as PrismaRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';

// PUT /api/rentals/[id]/return - Return an item
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rentalId } = await context.params;
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { item: true },
    });

    if (!rental) {
      return NextResponse.json({ message: 'Rental record not found' }, { status: 404 });
    }

    if (rental.returnedAt) {
      return NextResponse.json({ message: 'Item already returned' }, { status: 400 });
    }

    // Check if the user returning is the one who rented, or an admin
    const userProfile = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!userProfile || (rental.userId !== session.user.id && userProfile.role !== PrismaRole.ADMIN)) {
        return NextResponse.json({ message: 'Forbidden: You can only return your own rentals or an admin can return any.' }, { status: 403 });
    }

    const item = rental.item;
    if (!item) {
        // This should ideally not happen if DB integrity is maintained
        return NextResponse.json({ message: 'Associated item not found for this rental' }, { status: 500 });
    }

    const newQuantity = item.type === PrismaItemType.UNIQUE 
                        ? 1 
                        : item.quantity + rental.quantity;

    const updatedRental = await prisma.$transaction(async (tx) => {
      if (item.type !== PrismaItemType.CONSUMABLE) { // Consumables are not returned to stock
        await tx.item.update({
          where: { id: item.id },
          data: { quantity: newQuantity },
        });
      }

      return tx.rental.update({
        where: { id: rentalId },
        data: { returnedAt: new Date() },
        include: {
          item: { include: { category: true, box: true } },
          user: { select: { id: true, name: true, email: true } },
        }
      });
    });

    return NextResponse.json(updatedRental);
  } catch (error) {
    console.error(`Error returning item for rental ${rentalId}:`, error);
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Failed to return item. Rental or Item record not found.' }, { status: 404 });
        }
    }
    return NextResponse.json({ message: 'Error returning item' }, { status: 500 });
  }
}
