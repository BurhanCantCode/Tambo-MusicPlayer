# AI Music Player with Tambo & Deezer

A beautiful AI-powered music player built with Next.js, Tambo AI, and Deezer API. Users can ask the AI to find songs, discover music, and get surprised with random tracks - all displayed in stunning liquid glass music cards.

![AI Music Player Demo](https://img.shields.io/badge/Status-Working-brightgreen)

## 🎯 Features

- **AI Chat Interface** - Natural language music requests
- **Real-time Music Search** - Powered by Deezer's massive catalog  
- **Beautiful Liquid Glass UI** - Apple-inspired design with glassmorphism
- **30-second Audio Previews** - Playable directly in the chat
- **Interactive Audio Controls** - Seekable progress bar and play/pause
- **Direct Deezer Links** - Open full songs in Deezer
- **Random Music Discovery** - AI can surprise you with new tracks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Tambo API key (get free at [tambo.co/dashboard](https://tambo.co/dashboard))

### 1. Create Project
```bash
# Create new Tambo project
npx tambo create-app my-music-player
cd my-music-player

# Initialize Tambo (will open browser for API key)
npx tambo init
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create API Routes

Create the directory structure:
```bash
mkdir -p src/app/api/music/search
mkdir -p src/app/api/music/random
```

**Create `src/app/api/music/search/route.ts`:**
```typescript
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
```

**Create `src/app/api/music/random/route.ts`:**
```typescript
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
```

### 4. Create Music Data Service

**Create `src/services/music-data.ts`:**
```typescript
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
```

### 5. Create Music Card Component

Create directory:
```bash
mkdir -p src/components/music
```

**Create `src/components/music/MusicCard.tsx`:**
```typescript
"use client";

import { z } from "zod";
import { useState, useEffect, useRef } from "react";

export interface MusicCardProps {
  title: string;
  artist: string;
  album: string;
  duration: number;
  preview: string;
  link: string;
  albumCover?: string;
}

export const musicCardSchema = z.object({
  title: z.string().describe("Song title"),
  artist: z.string().describe("Artist name"),
  album: z.string().describe("Album name"),
  duration: z.number().describe("Duration in seconds"),
  preview: z.string().describe("Preview URL (30 seconds)"),
  link: z.string().describe("Full song link"),
  albumCover: z.string().optional().describe("Album cover URL"),
});

// SVG Icons
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  );
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function VolumeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 10v4h4l5 4V6l-5 4H4zm12.5 2a3.5 3.5 0 0 0-2.3-3.3v6.7a3.5 3.5 0 0 0 2.3-3.4zm-2.3-7.2v2.2a6 6 0 0 1 0 10v2.2a8.2 8.2 0 0 0 0-14.4z" />
    </svg>
  );
}

function ExternalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" d="M14 3h7v7m0-7L10 14" />
      <path strokeWidth="1.8" d="M21 14v5a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

export function MusicCard({
  title,
  artist,
  album,
  duration,
  preview,
  link,
  albumCover,
}: MusicCardProps) {
  if (!title || !artist || !preview) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && audio) {
      intervalRef.current = setInterval(() => setCurrentTime(audio.currentTime), 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, audio]);

  const format = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  const togglePlay = async () => {
    if (!audio) {
      setIsLoading(true);
      const a = new Audio(preview);
      a.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      a.addEventListener("loadedmetadata", () => {
        setAudioDuration(a.duration || 30);
        setIsLoading(false);
      });
      a.addEventListener("error", () => setIsLoading(false));
      setAudio(a);
      try {
        await a.play();
        setIsPlaying(true);
      } catch {
        setIsLoading(false);
      }
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {}
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (audio) audio.currentTime = t;
  };

  const pct = Math.min(100, Math.max(0, (currentTime / audioDuration) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto p-3">
      <div className="relative">
        {/* Liquid Glass panel */}
        <div
          className="
            relative rounded-[26px] overflow-hidden
            border border-white/60
            bg-black/40
            backdrop-blur-md
            shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8),0_8px_16px_rgba(0,0,0,0.6)]
          "
          style={{
            backgroundImage:
              "radial-gradient(120% 140% at 0% 0%, rgba(255,255,255,0.22), rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.06) 60%, rgba(0,0,0,0.08) 100%)",
          }}
        >
          {/* glossy highlight sweep */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-1 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/15 to-transparent" />
            <div className="absolute inset-0 [mask-image:linear-gradient(120deg,transparent,black_30%,black_70%,transparent)] bg-white/15" />
          </div>

          <div className="relative p-6 flex items-center gap-6">
            {/* album cover with glass shine */}
            <div className="relative shrink-0">
              <img
                src={albumCover || "/default-album.png"}
                alt={album}
                className="w-28 h-28 rounded-2xl object-cover ring-1 ring-white/30 shadow-2xl"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 via-white/15 to-transparent" />
            </div>

            {/* text + controls */}
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h2 className="text-white text-2xl font-bold leading-tight truncate drop-shadow-lg">
                  {title}
                </h2>
                <div className="text-white/95 truncate font-medium drop-shadow-md">by {artist}</div>
                <div className="text-white/85 text-sm truncate drop-shadow-md">from "{album}"</div>
              </div>

              {/* slider */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-white/70 font-mono min-w-[34px] text-right">
                  {format(Math.floor(currentTime))}
                </span>

                <div className="relative flex-1 h-2">
                  <div className="absolute inset-0 rounded-full bg-white/40 backdrop-blur-sm border border-white/20" />
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))",
                      boxShadow: "0 0 14px rgba(255,255,255,0.45)",
                    }}
                  />
                  <div
                    className="absolute -top-[6px] h-4 w-4 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-white/60"
                    style={{ left: `calc(${pct}% - 8px)` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={audioDuration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>

                <span className="text-[11px] text-white/70 font-mono min-w-[34px]">
                  {format(Math.floor(audioDuration))}
                </span>
              </div>

              {/* actions */}
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="
                      group relative h-12 w-12 rounded-full
                      border border-white/70 bg-white/50
                      backdrop-blur-xl
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_20px_rgba(0,0,0,0.5)]
                      transition-transform active:scale-[0.97] hover:bg-white/60
                      disabled:opacity-60
                    "
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent" />
                    {isPlaying ? (
                      <PauseIcon className="relative mx-auto text-white w-6 h-6" />
                    ) : (
                      <PlayIcon className="relative mx-auto text-white w-6 h-6" />
                    )}
                  </button>

                  <button
                    className="
                      relative h-10 w-10 rounded-full border border-white/50 bg-white/40
                      backdrop-blur-xl hover:bg-white/50 transition
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                    "
                    aria-label="Volume"
                    type="button"
                  >
                    <VolumeIcon className="mx-auto text-white w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => window.open(link, "_blank")}
                  className="
                    group relative px-5 h-11 rounded-full
                    text-[14px] font-semibold text-white
                    border border-white/60 bg-white/40 backdrop-blur-xl
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_20px_rgba(0,0,0,0.5)]
                    hover:bg-white/50 active:scale-[0.99] transition drop-shadow-lg
                  "
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
                  <span className="relative inline-flex items-center gap-2">
                    Open full track
                    <ExternalIcon className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* blurry album backdrop behind the card */}
        <div
          className="absolute inset-0 -z-20 rounded-[28px] blur-2xl opacity-70"
          style={{
            backgroundImage: `url(${albumCover || "/default-album.png"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div
          className="absolute inset-0 -z-10 rounded-[28px] blur-xl opacity-40"
          style={{
            backgroundImage: `url(${albumCover || "/default-album.png"})`,
            backgroundSize: "120%",
            backgroundPosition: "center",
          }}
        />
      </div>
    </div>
  );
}
```

### 6. Register Tools and Components

**Update `src/lib/tambo.ts`:**
```typescript
import { TamboComponent, TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import { MusicCard, musicCardSchema } from "@/components/music/MusicCard";
import { searchMusic, getRandomSong } from "@/services/music-data";

export const tools: TamboTool[] = [
  {
    name: "searchMusic",
    description:
      "Searches for music by song title, artist name, or any music-related query. Use this when users ask for specific songs, artists, or types of music.",
    tool: async (args: { query: string }) => {
      try {
        const { query } = args;
        
        if (!query || typeof query !== 'string') {
          throw new Error('Invalid search query provided');
        }
        
        const tracks = await searchMusic(query);
        
        if (!tracks || tracks.length === 0) {
          throw new Error(`No music found for "${query}"`);
        }
        
        const track = tracks[0];
        
        return {
          title: track.title,
          artist: track.artist.name,
          album: track.album.title,
          duration: track.duration,
          preview: track.preview,
          link: track.link,
          albumCover: track.album.cover_medium,
        };
      } catch (error) {
        console.error('Error in searchMusic tool:', error);
        throw new Error(error instanceof Error ? error.message : "Failed to search for music");
      }
    },
    toolSchema: z
      .function()
      .args(
        z.object({
          query: z.string().describe("Music search query (song title, artist name, or genre)"),
        })
      )
      .returns(musicCardSchema),
  },
  {
    name: "getRandomMusic",
    description:
      "Gets a random song to surprise the user. Use this when users ask to be surprised, want something random, or ask for music to cheer them up.",
    tool: async () => {
      try {
        const track = await getRandomSong();
        
        if (!track) {
          throw new Error('No random music found');
        }
        
        return {
          title: track.title,
          artist: track.artist.name,
          album: track.album.title,
          duration: track.duration,
          preview: track.preview,
          link: track.link,
          albumCover: track.album.cover_medium,
        };
      } catch (error) {
        console.error('Error in getRandomMusic tool:', error);
        throw new Error(error instanceof Error ? error.message : "Failed to get random music");
      }
    },
    toolSchema: z
      .function()
      .args(z.object({}))
      .returns(musicCardSchema),
  },
];

export const components: TamboComponent[] = [
  {
    name: "MusicCard",
    description:
      "A beautiful music player card that displays song information with album cover, artist image, and playable 30-second preview. Includes buttons to play preview and open full song on Deezer.",
    component: MusicCard,
    propsSchema: musicCardSchema,
  },
];
```

### 7. Update Chat Page

**Update `src/app/chat/page.tsx`:**
```typescript
"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";

export default function Home() {
  const mcpServers = useMcpServers();

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
<TamboProvider
  apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
        tools={tools}
        tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      >
        <TamboMcpProvider mcpServers={mcpServers}>
          <div className="w-full max-w-4xl mx-auto">
            <MessageThreadFull contextKey="music-chat" />
          </div>
        </TamboMcpProvider>
</TamboProvider>
    </div>
  );
}
```

### 8. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000/chat` and start asking for music!

## 🧪 Test Prompts

Try these in your chat:

- **"Play a song to cheer me up"** - Gets random uplifting music
- **"Find me some Billie Eilish"** - Searches for specific artist  
- **"Play Bohemian Rhapsody"** - Finds specific song
- **"Surprise me with music"** - Random song discovery
- **"I want some chill music"** - Searches by mood
- **"Play something energetic"** - Mood-based search

## 🛠️ How It Works

### Architecture
- **Next.js 15** - React framework with App Router
- **Tambo AI** - Handles natural language processing and component rendering
- **Deezer API** - Provides music search and metadata (no API key required)
- **Tailwind CSS** - Styling with custom glassmorphism effects

### Key Components
- **API Routes** - Handle music search and random song requests
- **MusicCard** - Liquid glass UI component with audio controls
- **Tambo Tools** - AI functions for music search and discovery
- **Audio System** - HTML5 Audio API for 30-second previews

### Liquid Glass Effect
The glassmorphism is achieved through:
- Multiple background layers with different blur levels
- Backdrop filters with controlled opacity
- Album artwork as blurred background
- CSS gradients for realistic glass reflections
- Custom shadow combinations for depth

## 🎨 Design Features

- **Horizontal Layout** - Optimized for desktop viewing
- **Interactive Audio Slider** - Seek through 30-second previews
- **Responsive Design** - Works on all screen sizes  
- **Custom SVG Icons** - Clean, modern iconography
- **Real-time Updates** - Live progress tracking
- **Smooth Animations** - Hover states and transitions

## 🔧 Customization

### Add More Music Sources
Extend the API routes to include other music services like Spotify, Apple Music, or SoundCloud.

### Enhance UI
- Add dark/light mode toggle
- Implement playlist functionality  
- Add favorite songs system
- Create music visualizations

### Improve AI
- Add music recommendation engine
- Implement user preference learning
- Create mood-based playlists
- Add lyrics display

## 📝 License

MIT License - feel free to use this project as a starting point for your own AI music applications.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.