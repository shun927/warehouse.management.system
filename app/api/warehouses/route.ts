import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';
import { Role } from '@/types';

// GET all warehouses
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json({ message: 'Error fetching warehouses' }, { status: 500 });
  }
}

// POST create a new warehouse (Admin only)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || dbUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Warehouse name is required and must be a string' }, { status: 400 });
    }

    // Check if warehouse with the same name already exists
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }, // Case-insensitive check
    });

    if (existingWarehouse) {
      return NextResponse.json({ message: `Warehouse with name "${name}" already exists` }, { status: 409 }); // 409 Conflict
    }

    const newWarehouse = await prisma.warehouse.create({
      data: { name },
    });
    return NextResponse.json(newWarehouse, { status: 201 });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json({ message: 'Error creating warehouse' }, { status: 500 });
  }
}
