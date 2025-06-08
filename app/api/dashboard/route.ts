import { NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const supabase = await createSupabaseRouteHandlerClient(); // Added await
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const overdueRentals = await prisma.rental.findMany({
      where: {
        userId: user.id,
        returnedAt: null,
        dueDate: {
          lt: now, // Less than now (i.e., in the past)
        },
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc', // Show the most overdue items first
      },
    });

    return NextResponse.json(overdueRentals);
  } catch (error) {
    console.error('Error fetching overdue rentals:', error);
    return NextResponse.json({ error: 'Failed to fetch overdue rentals' }, { status: 500 });
  }
}
