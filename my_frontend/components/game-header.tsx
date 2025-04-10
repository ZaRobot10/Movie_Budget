"use client"

import { Film, DollarSign } from "lucide-react"
import { motion } from "framer-motion"

export default function GameHeader() {
  return (
    <motion.div
      className="bg-gradient-to-r from-purple-900 to-indigo-900 py-6 px-4 text-center shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Film className="h-8 w-8 text-yellow-400" />
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-white">Movie Budget</span>
            <span className="text-yellow-400"> Guesser</span>
          </h1>
          <DollarSign className="h-8 w-8 text-yellow-400" />
        </div>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Test your knowledge of the film industry by guessing the production budgets of movies!
        </p>
      </div>
    </motion.div>
  )
}
