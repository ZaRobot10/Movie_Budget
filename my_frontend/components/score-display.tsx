"use client"

import { motion } from "framer-motion"
import { Award, TrendingUp, Trophy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ScoreDisplay({ mode, roundCount, totalScore, dailyIndex, dailyScore, dailyMovies }) {
  const isDaily = mode === "daily"
  const isDailyComplete = isDaily && dailyMovies.length > 0 && dailyIndex >= dailyMovies.length
  const isDailyInProgress = isDaily && dailyMovies.length > 0 && dailyIndex < dailyMovies.length

  // Calculate average score
  const averageScore = roundCount > 0 ? Math.round(totalScore / roundCount) : 0
  const dailyProgress = isDailyInProgress ? (dailyIndex / 5) * 100 : isDailyComplete ? 100 : 0

  // Get rank based on score
  const getRank = (score) => {
    if (score >= 90) return { title: "Movie Budget Expert", color: "text-yellow-400" }
    if (score >= 75) return { title: "Hollywood Insider", color: "text-blue-400" }
    if (score >= 60) return { title: "Film Enthusiast", color: "text-green-400" }
    if (score >= 40) return { title: "Casual Moviegoer", color: "text-orange-400" }
    return { title: "Movie Novice", color: "text-gray-400" }
  }

  const rank = getRank(isDaily ? dailyScore / (dailyIndex || 1) : averageScore)

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Your Stats
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isDaily ? "Daily challenge progress" : "Your ongoing game statistics"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isDaily ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-medium">{dailyIndex}/5 Rounds</span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-400 mb-1">Current Score</p>
                    <p className="text-3xl font-bold">{dailyScore}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-400 mb-1">Max Possible</p>
                    <p className="text-3xl font-bold">500</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-400 mb-1">Rounds Played</p>
                    <p className="text-3xl font-bold">{roundCount}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-400 mb-1">Total Score</p>
                    <p className="text-3xl font-bold">{totalScore}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Average Score</span>
                    <span className="text-sm font-medium">{averageScore}/100</span>
                  </div>
                  <Progress value={averageScore} className="h-2" />
                </div>
              </>
            )}

            <motion.div
              className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 text-center"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <Award className={`h-8 w-8 mx-auto mb-2 ${rank.color}`} />
              <p className="text-sm text-gray-400 mb-1">Your Rank</p>
              <p className={`text-xl font-bold ${rank.color}`}>{rank.title}</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Tips to Improve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">•</span>
              <span>Consider the film's genre - action and sci-fi often have higher budgets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">•</span>
              <span>Big-name actors and directors usually mean bigger budgets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">•</span>
              <span>Visual effects and CGI-heavy films tend to cost more</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">•</span>
              <span>Release year matters - budgets have inflated over time</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
