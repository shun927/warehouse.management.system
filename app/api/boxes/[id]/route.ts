import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient, Prisma, Role as PrismaRole } from '@prisma/client'; // Remove this
import { Prisma, Role as PrismaRole } from '@prisma/client'; // Add this
import prisma from '@/lib/prisma'; // Add this
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';

// GET a specific box by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed second argument
) {
  const supabase = await createSupabaseRouteHandlerClient(); // Ensured await
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params; // Await params
  const { id } = params;

  try {
    const box = await prisma.box.findUnique({
      where: { id },
      include: { warehouse: true, items: { include: { category: true } } },
    });

    if (!box) {
      return NextResponse.json({ message: 'Box not found' }, { status: 404 });
    }
    return NextResponse.json(box);
  } catch (error) {
    console.error('Error fetching box:', error);
    return NextResponse.json({ message: 'Error fetching box' }, { status: 500 });
  }
}

// PUT update a box by ID (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed second argument
) {
  const supabase = await createSupabaseRouteHandlerClient(); // Ensured await
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userProfile || userProfile.role !== PrismaRole.ADMIN) { // Use PrismaRole.ADMIN
    return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
  }

  const params = await context.params; // Await params
  const { id } = params;
  try {
    const body = await request.json();
    const {
        name,
        warehouseId,
        qrCodeUrl,
    } = body;

    const dataToUpdate: Prisma.BoxUpdateInput = {};

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ message: 'Box name is required and must be a non-empty string' }, { status: 400 });
        }
        dataToUpdate.name = name;
    }

    if (warehouseId !== undefined) {
        if (typeof warehouseId !== 'string') {
            return NextResponse.json({ message: 'Warehouse ID must be a string' }, { status: 400 });
        }
        const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
        if (!warehouse) {
            return NextResponse.json({ message: 'Warehouse not found' }, { status: 404 });
        }
        dataToUpdate.warehouse = { connect: { id: warehouseId } };
    }

    if (qrCodeUrl !== undefined) {
        // Allow setting qrCodeUrl to null by passing an empty string or null
        dataToUpdate.qrCodeUrl = (qrCodeUrl === "" || qrCodeUrl === null) ? null : qrCodeUrl;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: 'No fields to update provided.' }, { status: 400 });
    }

    const updatedBox = await prisma.box.update({
      where: { id },
      data: dataToUpdate,
      include: { warehouse: true, items: true },
    });
    return NextResponse.json(updatedBox);
  } catch (error: any) {
    console.error('Error updating box:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { 
            const target = (error.meta?.target as string[] | string) || (error.meta?.cause as string) || "related record";
            const message = (error.message.includes("Record to update not found") || (typeof target === 'string' && target.startsWith("prisma.box.update")))
                            ? 'Box not found' 
                            : `Error with related record: ${target}. Check if it exists.`;
            return NextResponse.json({ message, prismaCode: error.code, details: error.meta }, { status: 404 });
        }
         if (error.code === 'P2003') {
             return NextResponse.json({ message: 'Failed to update warehouse. Foreign key constraint failed.', prismaCode: error.code, meta: error.meta }, { status: 400 });
        }
    }
    return NextResponse.json({ message: 'Error updating box' }, { status: 500 });
  }
}

// DELETE a box by ID (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed second argument
) {
  const supabase = await createSupabaseRouteHandlerClient(); // Ensured await
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userProfile || userProfile.role !== PrismaRole.ADMIN) { // Use PrismaRole.ADMIN
    return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
  }

  const params = await context.params; // Await params
  const { id } = params;

  try {
    const itemsInBox = await prisma.item.count({
      where: { boxId: id },
    });

    if (itemsInBox > 0) {
      return NextResponse.json(
        { message: 'Cannot delete box: It contains items. Please move or delete items first.' },
        { status: 409 }
      );
    }
    
    const movementsOfBox = await prisma.movement.count({
        where: { boxId: id },
    });

    if (movementsOfBox > 0) {
        return NextResponse.json(
            { message: 'Cannot delete box: It has movement records. Please address these first.' },
            { status: 409 }
        );
    }

    await prisma.box.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Box deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting box:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return NextResponse.json({ message: 'Box not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting box' }, { status: 500 });
  }
}
