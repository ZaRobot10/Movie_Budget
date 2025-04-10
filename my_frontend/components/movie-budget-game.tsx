"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Search, Calendar, Award, Share2, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import GameHeader from "./game-header"
import MovieCard from "./movie-card"
import DiscoverFilters from "./discover-filters"
import ScoreDisplay from "./score-display"
import GuessForm from "./guess-form"
import ResultFeedback from "./result-feedback"

export default function MovieBudgetGame() {

  interface Movie {
    id: number;
    title: string;
    budget: number;
    poster?: string | null;
    tip?: string;
    // Optionally add other properties like release_date, vote_average, runtime, etc.
  }
  
  // Modes: "popular", "discover", or "daily"
  const [mode, setMode] = useState("popular")

  // For popular/discover modes: single movie view.
  const [movie, setMovie] = useState<Movie | null>(null);
const [dailyMovies, setDailyMovies] = useState<Movie[]>([]);

  const [dailyIndex, setDailyIndex] = useState(0)
  const [dailyScore, setDailyScore] = useState(0)
  // For daily, store the current round's computed score (but do not update index until next round).
  const [currentRoundScore, setCurrentRoundScore] = useState(0)

  // Common state variables.
  const [guess, setGuess] = useState("")
  const [feedback, setFeedback] = useState("")
  const [totalScore, setTotalScore] = useState(0)
  const [roundCount, setRoundCount] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Discover-specific filters.
  const [genres, setGenres] = useState("")
  const [minRating, setMinRating] = useState("")
  const [releaseBefore, setReleaseBefore] = useState("")
  const [releaseAfter, setReleaseAfter] = useState("")

  const { toast } = useToast()

  // Build URL to fetch data based on mode and filters.
  const buildFetchUrl = () => {
    // Use the backend URL from your environment variable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
  
    if (mode === "daily") return `${backendUrl}/api/daily`;
  
    let url = `${backendUrl}/api/movie?type=${mode === "discover" ? "discover" : "popular"}`;
    if (mode === "discover") {
      if (genres) url += `&genres=${encodeURIComponent(genres)}`;
      if (minRating) url += `&min_rating=${encodeURIComponent(minRating)}`;
      if (releaseBefore) url += `&release_before=${encodeURIComponent(releaseBefore)}`;
      if (releaseAfter) url += `&release_after=${encodeURIComponent(releaseAfter)}`;
    }
    return url;
  }
  
  // Fetch data based on the selected mode.
  const fetchData = () => {
    setLoading(true)
    fetch(buildFetchUrl())
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setFeedback(data.error)
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          })
        } else {
          if (mode === "daily") {
            // In Daily mode, store the fixed set of 5 movies, and reset daily state.
            setDailyMovies(data.movies)
            setDailyIndex(0)
            setDailyScore(0)
            setCurrentRoundScore(0)
          } else {
            // In popular/discover modes, store the single movie.
            setMovie(data)
          }
          setFeedback("")
          setGuess("")
          setSubmitted(false)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
        setFeedback("Error fetching movie data.")
        toast({
          title: "Connection Error",
          description: "Could not fetch movie data. Is your server running?",
          variant: "destructive",
        })
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [mode])

  // Handle submission of guess.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitted) return

    const guessInMillions = Number.parseFloat(guess)
    if (isNaN(guessInMillions) || guessInMillions < 0 || guessInMillions > 3000) {
      setFeedback("Please enter a valid number between 0 and 3000.")
      toast({
        title: "Invalid Guess",
        description: "Please enter a valid number between 0 and 3000.",
        variant: "destructive",
      })
      return
    }

    const userGuess = guessInMillions * 1000000
    // Use current movie: in Daily mode, the current movie is dailyMovies[dailyIndex].
    const currentMovie = mode === "daily" ? dailyMovies[dailyIndex] : movie
    if (!currentMovie) return

    const percentageDiff = (Math.abs(userGuess - currentMovie.budget) / currentMovie.budget) * 100
    let roundScore = 100 - percentageDiff
    if (roundScore < 0) roundScore = 0
    roundScore = Math.round(roundScore)

    if (mode === "daily") {
      // In Daily mode, store round score without moving to next round automatically.
      setCurrentRoundScore(roundScore)
    } else {
      const newRoundCount = roundCount + 1
      const newTotalScore = totalScore + roundScore
      setRoundCount(newRoundCount)
      setTotalScore(newTotalScore)
    }

    setSubmitted(true)

    const actualBudgetMillions = (currentMovie.budget / 1000000).toFixed(2)
    setFeedback(
      `Your guess is ${percentageDiff.toFixed(2)}% off. The actual budget is ${actualBudgetMillions} million. Round Score: ${roundScore}.`,
    )

    // Show toast with score
    toast({
      title:
        roundScore >= 90
          ? "Amazing Guess!"
          : roundScore >= 70
            ? "Great Guess!"
            : roundScore >= 50
              ? "Good Guess!"
              : "Not Bad!",
      description: `You scored ${roundScore} points this round!`,
      variant: roundScore >= 70 ? "default" : "destructive",
    })
  }

  // Handler for "Next Round" button.
  const handleNext = () => {
    setSubmitted(false)
    setGuess("")
    setFeedback("")
    if (mode === "daily") {
      // In Daily mode, add the current round's score and advance if not at end.
      setDailyScore((prev) => prev + currentRoundScore)
      setCurrentRoundScore(0)
      setDailyIndex((prevIndex) => prevIndex + 1)
    } else {
      fetchData()
    }
  }

  // Share result for Popular/Discover mode: include round count and total score.
  const handleSharePopular = () => {
    if (!movie) return
    const actualBudgetMillions = (movie.budget / 1000000).toFixed(2)
    const shareText = `🎬 Guess the Movie's Budget 🎬\nRounds Played: ${roundCount}\nTotal Score: ${totalScore}\nCan you beat my score?`
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "Your result has been copied to the clipboard. Share it with your friends!",
        })
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        })
      })
  }

  // Share result for Daily mode.
  const handleShareDaily = () => {
    const shareText = `🎬 Guess the Movie's Budget Daily Challenge 🎬\nRounds: 5\nScore: ${dailyScore}/500\nCan you beat my score?`
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "Your daily challenge result has been copied to the clipboard. Share it with your friends!",
        })
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        })
      })
  }

  // Unified share handler that branches by mode.
  const handleShare = () => {
    if (mode === "daily") {
      handleShareDaily()
    } else {
      handleSharePopular()
    }
  }

  const resetGame = () => {
    if (mode === "daily") {
      setDailyIndex(0)
      setDailyScore(0)
      setCurrentRoundScore(0)
    } else {
      setRoundCount(0)
      setTotalScore(0)
    }
    setSubmitted(false)
    setGuess("")
    setFeedback("")
    fetchData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <GameHeader />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Popular</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Daily</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <DiscoverFilters
              genres={genres}
              setGenres={setGenres}
              minRating={minRating}
              setMinRating={setMinRating}
              releaseBefore={releaseBefore}
              setReleaseBefore={setReleaseBefore}
              releaseAfter={releaseAfter}
              setReleaseAfter={setReleaseAfter}
              fetchData={fetchData}
            />
          </TabsContent>

          <div className="grid md:grid-cols-2 gap-8 mt-6">
            {/* Main Game Area */}
            <div>
              {mode === "daily" ? (
                <AnimatePresence mode="wait">
                  {dailyMovies.length > 0 && dailyIndex < dailyMovies.length ? (
                    <motion.div
                      key={dailyIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl">Daily Challenge</CardTitle>
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                              Round {dailyIndex + 1}/5
                            </Badge>
                          </div>
                          <CardDescription className="text-gray-400">
                            Guess the budget of today's featured movies
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <MovieCard movie={dailyMovies[dailyIndex]} loading={loading} />

                          <GuessForm
                            guess={guess}
                            setGuess={setGuess}
                            handleSubmit={handleSubmit}
                            submitted={submitted}
                            loading={loading}
                          />

                          {feedback && <ResultFeedback feedback={feedback} submitted={submitted} />}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={resetGame}
                            className="text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset
                          </Button>

                          {submitted && (
                            <Button
                              onClick={handleNext}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                              Next Movie
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ) : dailyMovies.length > 0 && dailyIndex >= dailyMovies.length ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-2xl text-center">Daily Challenge Complete!</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                          <Award className="h-24 w-24 text-yellow-400 mb-4" />
                          <h3 className="text-3xl font-bold mb-2">Your Score: {dailyScore}/500</h3>
                          <Progress value={(dailyScore / 500) * 100} className="w-full h-3 mb-6" />

                          <div className="grid grid-cols-2 gap-4 w-full">
                            <Button
                              variant="outline"
                              onClick={resetGame}
                              className="text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Play Again
                            </Button>

                            <Button
                              onClick={handleShare}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Result
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                      </CardContent>
                    </Card>
                  )}
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  {movie ? (
                    <motion.div
                      key={movie.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl">
                              {mode === "popular" ? "Popular Movies" : "Discover Movies"}
                            </CardTitle>
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              Round {roundCount + 1}
                            </Badge>
                          </div>
                          <CardDescription className="text-gray-400">Guess the budget of this movie</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <MovieCard movie={movie} loading={loading} />

                          <GuessForm
                            guess={guess}
                            setGuess={setGuess}
                            handleSubmit={handleSubmit}
                            submitted={submitted}
                            loading={loading}
                          />

                          {feedback && <ResultFeedback feedback={feedback} submitted={submitted} />}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={resetGame}
                            className="text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset
                          </Button>

                          <div className="flex gap-2">
                            {submitted && (
                              <Button
                                onClick={handleNext}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                              >
                                Next Movie
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            )}

                            {submitted && (
                              <Button
                                variant="outline"
                                onClick={handleShare}
                                className="border-green-600 text-green-400 hover:bg-green-900/20"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ) : (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                      </CardContent>
                    </Card>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Score Display */}
            <ScoreDisplay
              mode={mode}
              roundCount={roundCount}
              totalScore={totalScore}
              dailyIndex={dailyIndex}
              dailyScore={dailyScore}
              dailyMovies={dailyMovies}
            />
          </div>
        </Tabs>
      </div>
    </div>
  )
}
