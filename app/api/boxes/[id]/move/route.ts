import { NextRequest, NextResponse } from 'next/server';

// Type for the actual params object once resolved
type ResolvedParams = { id: string };

export async function POST(
  request: NextRequest,
  context: { params: Promise<ResolvedParams> } // Aligning with generated RouteContext for diagnosis
) {
  try {
    const params = await context.params; // Await the promise
    const { id } = params;
    // eslint-disable-next-line no-console
    console.log('Received box ID for move (simplified, with awaited params):', id);
    return NextResponse.json({ message: `Simplified: Attempting to move box ${id}` });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in simplified POST handler (with awaited params):', error);
    return NextResponse.json({ error: 'Internal server error in simplified handler' }, { status: 500 });
  }
}