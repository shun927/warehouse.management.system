import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ItemType as PrismaItemType, Role as PrismaRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';

// GET /api/items/[id] - Fetch a single item by ID
export async function GET(request: NextRequest, context: { params: any }) { // Simplified context type
  const { id } = context.params;
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error getting session in /api/items/[id]:', sessionError);
    return NextResponse.json({ message: 'Failed to get session' }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        box: {
          include: {
            warehouse: true, // Include warehouse details
          },
        },
        rentals: { // Include active rentals for this item
          where: { returnedAt: null },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: {
            rentedAt: 'desc',
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return NextResponse.json({ message: 'Error fetching item' }, { status: 500 });
  }
}

// PUT /api/items/[id] - Update an existing item (Admin only)
export async function PUT(request: NextRequest, context: { params: any }) { // Simplified context type
  const { id } = context.params;
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error getting session in PUT /api/items/[id]:', sessionError);
    return NextResponse.json({ message: 'Failed to get session for update' }, { status: 500 });
  }

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
      qrCodeUrl, // Assuming qrCodeUrl might be updatable, though usually auto-generated
      imageUrl, // Added imageUrl
    } = body;

    const dataToUpdate: Prisma.ItemUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description === "" ? null : description;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl === "" ? null : imageUrl;
    
    if (quantity !== undefined) {
      const parsedQuantity = parseInt(quantity as string, 10);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return NextResponse.json({ message: 'Quantity must be a non-negative number.' }, { status: 400 });
      }
      dataToUpdate.quantity = parsedQuantity;
    }

    if (type !== undefined) {
      if (!Object.values(PrismaItemType).includes(type as PrismaItemType)) {
        return NextResponse.json({ message: `Invalid item type. Must be one of ${Object.values(PrismaItemType).join(', ')}` }, { status: 400 });
      }
      dataToUpdate.type = type as PrismaItemType;
    }

    // Handle categoryId: null means disconnect, string means connect
    if (categoryId !== undefined) {
      dataToUpdate.category = categoryId ? { connect: { id: categoryId } } : { disconnect: true };
    }
    
    // Handle boxId: null means disconnect, string means connect
    if (boxId !== undefined) {
      dataToUpdate.box = boxId ? { connect: { id: boxId } } : { disconnect: true };
    }

    if (qrCodeUrl !== undefined) { // Though usually not manually set if auto-generated
      dataToUpdate.qrCodeUrl = qrCodeUrl === "" ? null : qrCodeUrl;
    }
    
    // Add updatedBy relation if your schema supports it
    // dataToUpdate.updatedBy = { connect: { id: session.user.id } };
    // dataToUpdate.updatedAt = new Date(); // Prisma typically handles this automatically

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: 'No fields to update provided.' }, { status: 400 });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
        box: {
          include: { // Ensure warehouse is included in response
            warehouse: true,
          }
        },
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error(`Error updating item ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            const target = (error.meta?.target as string[] | string) || (error.meta?.cause as string) || "related record";
            const message = (error.message.includes("Record to update not found") || (typeof target === 'string' && target.startsWith("prisma.item.update")))
                            ? 'Item not found' 
                            : `Error with related record: ${target}. Check if it exists.`;
            return NextResponse.json({ message, prismaCode: error.code, details: error.meta }, { status: 404 });
        }
        if (error.code === 'P2003') { 
             return NextResponse.json({ message: 'Failed to update related record. Foreign key constraint failed.', prismaCode: error.code, meta: error.meta }, { status: 400 });
        }
    }
    return NextResponse.json({ message: 'Error updating item' }, { status: 500 });
  }
}

// DELETE /api/items/[id] - Delete an item (Admin only)
export async function DELETE(request: NextRequest, context: { params: any }) { // Simplified context type
  const { id } = context.params;
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error getting session in DELETE /api/items/[id]:', sessionError);
    return NextResponse.json({ message: 'Failed to get session for delete' }, { status: 500 });
  }

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
    // Check for active rentals before deleting
    const activeRentals = await prisma.rental.count({
      where: {
        itemId: id,
        returnedAt: null,
      },
    });

    if (activeRentals > 0) {
      return NextResponse.json({ message: 'Cannot delete item. It has active rentals.' }, { status: 409 });
    }

    await prisma.item.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting item ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record to delete not found
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }
        // P2003 (Foreign key constraint failed) might still occur if other relations exist
        // that are not covered by the active rentals check (e.g., audit logs, etc.)
        // For now, the active rentals check is the primary concern.
    }
    return NextResponse.json({ message: 'Error deleting item' }, { status: 500 });
  }
}
