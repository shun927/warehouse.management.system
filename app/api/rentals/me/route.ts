import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient(); // Await the async function

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error getting session in /api/rentals/me:', sessionError);
    return NextResponse.json({ message: 'Failed to get session' }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rentals = await prisma.rental.findMany({
      where: {
        userId: session.user.id,
        returnedAt: null, // Only fetch active rentals
      },
      include: {
        item: {
          include: {
            category: true,
            box: true,
          },
        },
        // User details are implicitly the current user, but including for consistency with Rental type
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc', // Show items due soonest first
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    return NextResponse.json({ message: 'Error fetching user rentals' }, { status: 500 });
  }
}
