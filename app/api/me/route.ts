import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Corrected import
import { User as AppUser, Role as AppRole } from '@/types';
import prisma from '@/lib/prisma'; // Import shared Prisma client

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient(); // Added await here
  const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser();

  if (supabaseError || !supabaseUser) {
    console.error('Error fetching Supabase user or no user:', supabaseError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userProfile;
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!dbUser) {
      // User exists in Supabase Auth but not in our DB, create a default profile
      console.warn(`User profile not found in DB for Supabase user ID: ${supabaseUser.id}. Creating a default one for now.`);
      try {
        const newUser = await prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.email!, // Default name to email
            role: 'MEMBER', // Prisma Role enum
            // grade: 0, // Ensure grade is not here
          },
        });
        // Convert Prisma User to AppUser
        userProfile = {
          ...newUser,
          role: newUser.role as AppRole, // Cast Prisma Role to AppRole
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        };
      } catch (dbError) {
        console.error('Error creating user profile in DB:', dbError);
        const fallbackAppUser: AppUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || 'fallback@example.com',
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email || 'Fallback User',
          role: AppRole.MEMBER,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return NextResponse.json(fallbackAppUser);
      }
    } else {
      // Convert Prisma User to AppUser if fetched from DB
      userProfile = {
        ...dbUser,
        role: dbUser.role as AppRole, // Cast Prisma Role to AppRole
        createdAt: dbUser.createdAt.toISOString(),
        updatedAt: dbUser.updatedAt.toISOString(),
      };
    }
  } catch (error) {
    console.error('Error fetching user profile from DB:', error);
    const fallbackAppUser: AppUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || 'fallback@example.com',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email || 'Fallback User',
      role: AppRole.MEMBER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(fallbackAppUser, { status: 500 });
  }

  if (userProfile) {
    return NextResponse.json(userProfile as AppUser);
  }

  return NextResponse.json({ error: 'User profile could not be determined.' }, { status: 500 });
}
