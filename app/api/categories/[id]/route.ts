import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Add this
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';
import { Role } from '@/types';

// GET a specific category by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // Changed second argument
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const params = await context.params; // Await params
  const { id } = params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ message: 'Error fetching category' }, { status: 500 });
  }
}

// PUT update a category by ID (Admin only)
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> } // Changed second argument
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const dbUser = await prisma.user.findUnique({ // Added Prisma query
    where: { id: user.id },
  });

  if (!dbUser || dbUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
  }

  const params = await context.params; // Await params
  const { id } = params;
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Category name is required and must be a string' }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating category' }, { status: 500 });
  }
}

// DELETE a category by ID (Admin only)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> } // Changed second argument
) {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const dbUser = await prisma.user.findUnique({ // Added Prisma query
    where: { id: user.id },
  });

  if (!dbUser || dbUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
  }

  const params = await context.params; // Await params
  const { id } = params;

  try {
    // Optional: Check if any items are associated with this category before deleting
    const itemsInCategory = await prisma.item.count({
      where: { categoryId: id },
    });

    if (itemsInCategory > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category: It is associated with existing items. Please reassign items first.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
  }
}
