import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ItemType as PrismaItemType, Role as PrismaRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server'; 

// GET /api/items - Fetch all items with optional search
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    const items = await prisma.item.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              // Filter by related fields - Prisma syntax for to-one relations
              { category: { is: { name: { contains: query, mode: 'insensitive' } } } },
              { box: { is: { name: { contains: query, mode: 'insensitive' } } } },
            ],
          }
        : {},
      orderBy: {
        updatedAt: 'desc', 
      },
      include: {
        category: true, 
        box: true,      
      }
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ message: 'Error fetching items' }, { status: 500 });
  }
}

// POST /api/items - Create a new item (Admin only)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient(); // Added await
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userProfile || userProfile.role !== PrismaRole.ADMIN) {
    return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      quantity,
      type,
      categoryId,
      boxId,
    } = body;

    if (!name || quantity === undefined || !type) {
      return NextResponse.json({ message: 'Missing required fields: name, quantity, type' }, { status: 400 });
    }
    
    const parsedQuantity = parseInt(quantity as string, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return NextResponse.json({ message: 'Invalid quantity format or value.' }, { status: 400 });
    }

    if (!Object.values(PrismaItemType).includes(type as PrismaItemType)) {
        return NextResponse.json({ message: `Invalid item type. Must be one of ${Object.values(PrismaItemType).join(', ')}` }, { status: 400 });
    }

    const itemData: Prisma.ItemCreateInput = {
      name,
      description: description || null,
      quantity: parsedQuantity,
      type: type as PrismaItemType,
      qrCodeUrl: '', // Placeholder, will be updated after creation
      ...(categoryId && { category: { connect: { id: categoryId } } }),
      ...(boxId && { box: { connect: { id: boxId } } }),
    };

    const newItem = await prisma.item.create({
      data: itemData,
    });

    const generatedQrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/items/${newItem.id}`;

    const updatedItemWithQrAndRelations = await prisma.item.update({
      where: { id: newItem.id },
      data: { qrCodeUrl: generatedQrCodeUrl },
      include: { 
        category: true,
        box: true,
      }
    });

    return NextResponse.json(updatedItemWithQrAndRelations, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003' || error.code === 'P2025') { 
        return NextResponse.json({ message: 'Invalid or non-existent category or box ID provided.' }, { status: 400 });
      }
    }
    return NextResponse.json({ message: 'Error creating item' }, { status: 500 });
  }
}
