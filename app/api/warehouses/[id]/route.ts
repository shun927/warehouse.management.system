// app/api/warehouses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client'; // Using Prisma Role directly

// GET a specific warehouse by ID
export async function GET(
  request: NextRequest,
  { params }: { params: any } // Simplified context type
) {
  const supabase = await createSupabaseServerClient(); // Added await
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }
    return NextResponse.json(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    return NextResponse.json({ error: 'Failed to fetch warehouse' }, { status: 500 });
  }
}

// PUT update a warehouse by ID (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: any } // Simplified context type
) {
  const supabase = await createSupabaseServerClient(); // Added await
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { role: true },
  });

  if (!userProfile || userProfile.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  const { id } = params;
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Warehouse name is required and must be a non-empty string' }, { status: 400 });
    }

    // Optional: Check if another warehouse with the same name already exists (excluding the current one)
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        id: {
          not: id,
        },
      },
    });

    if (existingWarehouse) {
      return NextResponse.json({ error: `Another warehouse with the name \"${name}\" already exists.` }, { status: 409 });
    }

    const updatedWarehouse = await prisma.warehouse.update({
      where: { id },
      data: { name: name.trim() },
    });
    return NextResponse.json(updatedWarehouse);
  } catch (error: any) {
    console.error('Error updating warehouse:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 });
  }
}

// DELETE a warehouse by ID (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: any } // Simplified context type
) {
  const supabase = await createSupabaseServerClient(); // Added await
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { role: true },
  });

  if (!userProfile || userProfile.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  const { id } = params;

  try {
    // Check if there are any boxes in this warehouse
    const boxesInWarehouse = await prisma.box.count({
      where: { warehouseId: id },
    });

    if (boxesInWarehouse > 0) {
      return NextResponse.json({ error: 'Cannot delete warehouse: it contains boxes. Please move or delete them first.' }, { status: 400 });
    }

    await prisma.warehouse.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Warehouse deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting warehouse:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete warehouse' }, { status: 500 });
  }
}
