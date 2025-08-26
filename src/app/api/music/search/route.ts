import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Deezer API is public - no API key needed!
    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`
    );

    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Music search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search for music' },
      { status: 500 }
    );
  }
}
