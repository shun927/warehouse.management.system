import { NextRequest, NextResponse } from 'next/server';
import { Role as PrismaRole, ItemType as PrismaItemType, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';

// POST /api/rentals - Create a new rental (Lend an item)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { itemId, quantity: requestedQuantity, dueDate } = body;

    if (!itemId || requestedQuantity === undefined || !dueDate) {
      return NextResponse.json({ message: 'Missing required fields: itemId, quantity, dueDate' }, { status: 400 });
    }

    const parsedQuantity = parseInt(requestedQuantity as string, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json({ message: 'Quantity must be a positive number.' }, { status: 400 });
    }

    if (new Date(dueDate) <= new Date()) {
        return NextResponse.json({ message: 'Due date must be in the future.' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });

    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    if (item.type === PrismaItemType.UNIQUE) {
      if (parsedQuantity !== 1) {
        return NextResponse.json({ message: 'Unique items can only be rented one at a time.' }, { status: 400 });
      }
      if (item.quantity !== 1) {
        return NextResponse.json({ message: 'Unique item is not available for rent.' }, { status: 409 });
      }
    } else if (item.type === PrismaItemType.COUNTABLE || item.type === PrismaItemType.CONSUMABLE) {
      if (item.quantity < parsedQuantity) {
        return NextResponse.json({ message: `Not enough stock. Available: ${item.quantity}` }, { status: 409 });
      }
    }

    const newQuantity = item.type === PrismaItemType.UNIQUE ? 0 : item.quantity - parsedQuantity;

    const rentalData = {
      userId: session.user.id,
      itemId,
      quantity: parsedQuantity,
      dueDate: new Date(dueDate),
      rentedAt: new Date(),
    };

    const createdRental = await prisma.$transaction(async (tx) => {
      await tx.item.update({
        where: { id: itemId },
        data: { quantity: newQuantity },
      });

      return tx.rental.create({
        data: rentalData,
        include: {
          item: { include: { category: true, box: true } },
          user: { select: { id: true, name: true, email: true } }, // Removed grade
        }
      });
    });

    return NextResponse.json(createdRental, { status: 201 });

  } catch (error) {
    console.error('Error creating rental:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if needed
        if (error.code === 'P2025') { // An operation failed because it depends on one or more records that were required but not found. (e.g. item not found)
             return NextResponse.json({ message: 'Failed to create rental. Related record not found.' }, { status: 404 });
        }
    }
    return NextResponse.json({ message: 'Error creating rental' }, { status: 500 });
  }
}

// GET /api/rentals - Fetch all rentals (Admin only)
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    // select: { role: true, grade: true }, // Removed grade selection
  });

  if (!userProfile || userProfile.role !== PrismaRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    const rentals = await prisma.rental.findMany({
      include: {
        item: { include: { category: true, box: true } },
        user: { select: { id: true, name: true, email: true } }, // Removed grade
      },
      orderBy: {
        rentedAt: 'desc',
      },
    });
    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json({ message: 'Error fetching rentals' }, { status: 500 });
  }
}
