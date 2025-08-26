export interface TrackInfo {
  id: number;
  title: string;
  title_short: string;
  artist: {
    id: number;
    name: string;
    picture_medium: string;
  };
  album: {
    id: number;
    title: string;
    cover_medium: string;
  };
  duration: number;
  preview: string;
  link: string;
  rank: number;
}

/**
 * Searches for music tracks
 */
export async function searchMusic(query: string): Promise<TrackInfo[]> {
  try {
    const response = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error searching music:', error);
    throw error;
  }
}

/**
 * Gets a random song to surprise users
 */
export async function getRandomSong(): Promise<TrackInfo | null> {
  try {
    const response = await fetch('/api/music/random');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error getting random song:', error);
    throw error;
  }
}

/**
 * Formats duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
