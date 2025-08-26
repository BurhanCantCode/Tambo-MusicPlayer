"use client";

import { z } from "zod";
import { useState, useEffect, useRef } from "react";

export interface MusicCardProps {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  preview: string;
  link: string;
  artistImage?: string;
  albumCover?: string;
  rank?: number;
}

export const musicCardSchema = z.object({
  id: z.number().describe("Track ID"),
  title: z.string().describe("Song title"),
  artist: z.string().describe("Artist name"),
  album: z.string().describe("Album name"),
  duration: z.number().describe("Duration in seconds"),
  preview: z.string().describe("Preview URL (30 seconds)"),
  link: z.string().describe("Full song link"),
  artistImage: z.string().optional().describe("Artist image URL"),
  albumCover: z.string().optional().describe("Album cover URL"),
  rank: z.number().optional().describe("Song popularity rank"),
});

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
      {/* Ambient gradient to make blur visible */}
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
            // very subtle inner refraction + noise
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
                   {/* track */}
                   <div className="absolute inset-0 rounded-full bg-white/40 backdrop-blur-sm border border-white/20" />
                  {/* progress fill with specular edge */}
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))",
                      boxShadow: "0 0 14px rgba(255,255,255,0.45)",
                    }}
                  />
                  {/* thumb */}
                  <div
                    className="absolute -top-[6px] h-4 w-4 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-white/60"
                    style={{ left: `calc(${pct}% - 8px)` }}
                  />
                  {/* native input */}
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
                                         className={`
                       group relative h-12 w-12 rounded-full
                       border border-white/70 bg-white/50
                       backdrop-blur-xl
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_20px_rgba(0,0,0,0.5)]
                       transition-transform active:scale-[0.97] hover:bg-white/60
                       disabled:opacity-60
                     `}
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

                {/* neutral glass CTA (no loud brand colors) */}
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

          {/* soft colored glow sourced from cover to sell the glass */}
          <div
            className="pointer-events-none absolute -z-10 blur-[70px] opacity-50"
            style={{
              inset: "-40%",
              background:
                `radial-gradient(50% 50% at 20% 10%, rgba(255,255,255,0.25) 0%, transparent 60%),
                 radial-gradient(60% 60% at 80% 90%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            }}
          />
        </div>

                 {/* blurry album backdrop behind the card - more prominent */}
         <div
           className="absolute inset-0 -z-20 rounded-[28px] blur-2xl opacity-70"
           style={{
             backgroundImage: `url(${albumCover || "/default-album.png"})`,
             backgroundSize: "cover",
             backgroundPosition: "center",
           }}
         />
         
         {/* Additional softer background layer for depth */}
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
