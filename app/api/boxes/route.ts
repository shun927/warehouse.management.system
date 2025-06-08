import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Add this
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';
import { Role } from '@/types';

// GET /api/boxes - Fetch all boxes
export async function GET(request: NextRequest) {
  try {
    const boxes = await prisma.box.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        warehouse: true, // Include warehouse information
      }
    });
    return NextResponse.json(boxes);
  } catch (error) {
    console.error('Error fetching boxes:', error);
    return NextResponse.json({ message: 'Error fetching boxes' }, { status: 500 });
  }
}

// POST /api/boxes - Create a new box (Admin only)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient(); // Ensure await is present
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userProfile || userProfile.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, warehouseId } = body; // qrCodeUrl will be handled separately

    if (!name || !warehouseId) {
      return NextResponse.json({ message: 'Missing required fields: name, warehouseId' }, { status: 400 });
    }

    // Optional: Check if box with the same name already exists in the same warehouse
    const existingBox = await prisma.box.findFirst({
        where: {
            name: {
                equals: name,
                mode: 'insensitive',
            },
            warehouseId: warehouseId,
        }
    });

    if (existingBox) {
        return NextResponse.json({ message: `Box with name "${name}" already exists in this warehouse.` }, { status: 409 });
    }

    const newBox = await prisma.box.create({
      data: {
        name,
        warehouseId,
        qrCodeUrl: '', // Placeholder, will be updated immediately
      },
      // Temporarily remove include to isolate Prisma issue
      // include: {
      //   warehouse: true,
      // }
    });

    // Generate qrCodeUrl based on the new box's ID
    const generatedQrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/boxes/${newBox.id}`;

    const updatedBoxWithQr = await prisma.box.update({
      where: { id: newBox.id },
      data: { qrCodeUrl: generatedQrCodeUrl },
      include: {
        warehouse: true, // Attempt to include warehouse in the final response
      }
    });

    return NextResponse.json(updatedBoxWithQr, { status: 201 });
  } catch (error) {
    console.error('Error creating box:', error);
    return NextResponse.json({ message: 'Error creating box' }, { status: 500 });
  }
}
