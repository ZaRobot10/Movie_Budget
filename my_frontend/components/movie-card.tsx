"use client"

import React from "react"
import { motion } from "framer-motion"
import { Calendar, Star, Clock, Info, Film } from "lucide-react"
import { Skeleton } from "../components/ui/skeleton"

// Define an interface for the movie object.
// Adjust fields according to your actual movie data.
interface Movie {
  title: string;
  poster?: string | null;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  tip?: string;
}

// Define props for the MovieCard component.
interface MovieCardProps {
  movie?: Movie | null;
  loading: boolean;
}

export default function MovieCard({ movie, loading }: MovieCardProps) {
  if (loading || !movie) {
    return (
      <div className="mb-6 space-y-4">
        <Skeleton className="h-8 w-3/4 bg-gray-700" />
        <Skeleton className="h-[300px] w-full bg-gray-700" />
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-4 w-2/3 bg-gray-700" />
      </div>
    )
  }

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-3">{movie.title}</h2>

      {movie.poster ? (
        <div className="relative rounded-lg overflow-hidden mb-4 shadow-xl">
          <img
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            className="w-full object-cover aspect-[2/3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-wrap gap-3">
            {movie.release_date && (
              <div className="flex items-center bg-black/60 rounded-full px-3 py-1 text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(movie.release_date).getFullYear()}
              </div>
            )}

            {typeof movie.vote_average === "number" && (
              <div className="flex items-center bg-yellow-600/80 rounded-full px-3 py-1 text-sm">
                <Star className="h-3 w-3 mr-1 fill-white" />
                {movie.vote_average.toFixed(1)}
              </div>
            )}

            {movie.runtime && (
              <div className="flex items-center bg-black/60 rounded-full px-3 py-1 text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {movie.runtime} min
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg h-[300px] flex items-center justify-center mb-4">
          <Film className="h-16 w-16 text-gray-500" />
        </div>
      )}

      <div className="bg-gray-700/50 rounded-lg p-4 mb-4 border-l-4 border-yellow-500">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-gray-300">{movie.tip}</p>
        </div>
      </div>
    </motion.div>
  )
}
