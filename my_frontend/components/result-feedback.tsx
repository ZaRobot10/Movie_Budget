"use client"

import React from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
// If you don't want to use alias, adjust the path accordingly. For example:
// import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ResultFeedbackProps {
  feedback: string;
  submitted: boolean;
}

export default function ResultFeedback({ feedback, submitted }: ResultFeedbackProps) {
  if (!feedback || !submitted) return null

  // Extract score from feedback
  const scoreMatch = feedback.match(/Round Score: (\d+)/)
  const score = scoreMatch ? Number.parseInt(scoreMatch[1]) : 0

  // Extract percentage off
  const percentMatch = feedback.match(/Your guess is ([\d.]+)% off/)
  const percentOff = percentMatch ? Number.parseFloat(percentMatch[1]) : 0

  // Extract actual budget
  const budgetMatch = feedback.match(/The actual budget is ([\d.]+) million/)
  const actualBudget = budgetMatch ? budgetMatch[1] : "unknown"

  let icon = <AlertCircle className="h-5 w-5 text-yellow-500" />
  let title = "Not Bad!"
  let variant = "default"

  if (score >= 90) {
    icon = <CheckCircle className="h-5 w-5 text-green-500" />
    title = "Amazing Guess!"
    variant = "success"
  } else if (score >= 70) {
    icon = <CheckCircle className="h-5 w-5 text-blue-500" />
    title = "Great Guess!"
    variant = "info"
  } else if (score < 30) {
    icon = <XCircle className="h-5 w-5 text-red-500" />
    title = "Way Off!"
    variant = "destructive"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert
        className={`
          border-l-4 
          ${
            score >= 90
              ? "border-l-green-500 bg-green-500/10"
              : score >= 70
                ? "border-l-blue-500 bg-blue-500/10"
                : score < 30
                  ? "border-l-red-500 bg-red-500/10"
                  : "border-l-yellow-500 bg-yellow-500/10"
          }
        `}
      >
        <div className="flex items-start">
          {icon}
          <div className="ml-3">
            <AlertTitle className="text-lg font-semibold mb-1">{title}</AlertTitle>
            <AlertDescription className="text-gray-300">
              <p>
                You were <span className="font-bold">{percentOff.toFixed(2)}%</span> off the actual budget.
              </p>
              <p>
                The actual budget was <span className="font-bold">${actualBudget} million</span>.
              </p>
              <p className="mt-2">
                <span className="font-bold text-lg">Score: </span>
                <span
                  className={`font-bold text-lg ${
                    score >= 90
                      ? "text-green-500"
                      : score >= 70
                        ? "text-blue-500"
                        : score < 30
                          ? "text-red-500"
                          : "text-yellow-500"
                  }`}
                >
                  {score}
                </span>{" "}
                points
              </p>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </motion.div>
  )
}
