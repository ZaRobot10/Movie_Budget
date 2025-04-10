"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DiscoverFilters({
  genres,
  setGenres,
  minRating,
  setMinRating,
  releaseBefore,
  setReleaseBefore,
  releaseAfter,
  setReleaseAfter,
  fetchData,
}) {
  const [expanded, setExpanded] = useState(false)
  const [ratingValue, setRatingValue] = useState(minRating ? Number.parseFloat(minRating) * 10 : 0)

  const genreOptions = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
  ]

  const handleGenreClick = (id) => {
    const currentGenres = genres ? genres.split(",").map((g) => g.trim()) : []
    const idStr = id.toString()

    if (currentGenres.includes(idStr)) {
      setGenres(currentGenres.filter((g) => g !== idStr).join(","))
    } else {
      setGenres([...currentGenres, idStr].join(","))
    }
  }

  const handleRatingChange = (value) => {
    setRatingValue(value[0])
    setMinRating((value[0] / 10).toFixed(1))
  }

  const clearFilters = () => {
    setGenres("")
    setMinRating("")
    setRatingValue(0)
    setReleaseBefore("")
    setReleaseAfter("")
  }

  const handleApplyFilters = () => {
    fetchData()
    setExpanded(false)
  }

  const selectedGenreIds = genres ? genres.split(",").map((g) => g.trim()) : []

  return (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Discover Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white"
          >
            {expanded ? "Hide" : "Show"} Filters
          </Button>
        </div>
        <CardDescription className="text-gray-400">Customize your movie discovery experience</CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-gray-300">Genres</Label>
              {selectedGenreIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGenres("")}
                  className="h-6 text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={selectedGenreIds.includes(genre.id.toString()) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedGenreIds.includes(genre.id.toString())
                      ? "bg-purple-700 hover:bg-purple-800"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => handleGenreClick(genre.id)}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Minimum Rating: {minRating || "Any"}</Label>
            <Slider
              value={[ratingValue]}
              min={0}
              max={100}
              step={5}
              onValueChange={handleRatingChange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>5.0</span>
              <span>10.0</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Release After (Year)</Label>
              <Input
                type="number"
                value={releaseAfter}
                onChange={(e) => setReleaseAfter(e.target.value)}
                placeholder="e.g., 2000"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Release Before (Year)</Label>
              <Input
                type="number"
                value={releaseBefore}
                onChange={(e) => setReleaseBefore(e.target.value)}
                placeholder="e.g., 2023"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      )}

      {expanded && (
        <CardFooter className="flex justify-between pt-0">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
