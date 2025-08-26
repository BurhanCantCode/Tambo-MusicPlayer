/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { MusicCard, musicCardSchema } from "@/components/music/MusicCard";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import { searchMusic, getRandomSong } from "@/services/music-data";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    toolSchema: z
      .function()
      .args(z.string().describe("The continent to filter countries by"))
      .returns(
        z
          .object({
            continent: z.string().optional(),
            sortBy: z.enum(["population", "growthRate"]).optional(),
            limit: z.number().optional(),
            order: z.enum(["asc", "desc"]).optional(),
          })
          .optional(),
      ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    toolSchema: z
      .function()
      .args(z.string().describe("The continent to filter countries by"))
      .returns(
        z
          .object({
            startYear: z.number().optional(),
            endYear: z.number().optional(),
          })
          .optional(),
      ),
  },
  {
    name: "searchMusic",
    description:
      "Searches for music by song title, artist name, or any music-related query. Use this when users ask for specific songs, artists, or types of music. Returns a music card with preview and Deezer link.",
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
        
        // Return the first (best) result
        const track = tracks[0];
        
        return {
          id: track.id,
          title: track.title,
          artist: track.artist.name,
          album: track.album.title,
          duration: track.duration,
          preview: track.preview,
          link: track.link,
          artistImage: track.artist.picture_medium,
          albumCover: track.album.cover_medium,
          rank: track.rank,
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
      "Gets a random song to surprise the user. Use this when users ask to be surprised, want something random, or ask for music to cheer them up without specifying what they want.",
    tool: async () => {
      try {
        const track = await getRandomSong();
        
        if (!track) {
          throw new Error('No random music found');
        }
        
        return {
          id: track.id,
          title: track.title,
          artist: track.artist.name,
          album: track.album.title,
          duration: track.duration,
          preview: track.preview,
          link: track.link,
          artistImage: track.artist.picture_medium,
          albumCover: track.album.cover_medium,
          rank: track.rank,
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
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "MusicCard",
    description:
      "A beautiful music player card that displays song information with album cover, artist image, and playable 30-second preview. Includes buttons to play preview and open full song on Deezer.",
    component: MusicCard,
    propsSchema: musicCardSchema,
  },
  // Add more components here
];
