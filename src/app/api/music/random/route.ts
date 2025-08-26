import { NextResponse } from "next/server";

const MOOD_QUERIES = [
  "happy upbeat songs",
  "chill relaxing music",
  "energetic workout songs",
  "feel good vibes",
  "motivational music",
  "peaceful ambient",
  "uplifting pop songs",
  "smooth jazz",
  "indie feel good",
  "classic rock hits"
];

export async function GET() {
  try {
    // Pick a random mood query
    const randomQuery = MOOD_QUERIES[Math.floor(Math.random() * MOOD_QUERIES.length)];
    
    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(randomQuery)}&limit=50`
    );

    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return a random song from the results
    if (data.data && data.data.length > 0) {
      const randomTrack = data.data[Math.floor(Math.random() * data.data.length)];
      return NextResponse.json({ data: [randomTrack] });
    }
    
    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error('Random music API error:', error);
    return NextResponse.json(
      { error: 'Failed to get random music' },
      { status: 500 }
    );
  }
}
