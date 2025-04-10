"use client"

import { DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"

export default function GuessForm({ guess, setGuess, handleSubmit, submitted, loading }) {
  const [sliderValue, setSliderValue] = useState(guess ? Number.parseFloat(guess) : 100)

  // Update slider when guess changes (for resets)
  useEffect(() => {
    if (guess === "") {
      setSliderValue(100)
    }
  }, [guess])

  const handleSliderChange = (value) => {
    setSliderValue(value[0])
    setGuess(value[0].toString())
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setGuess(value)
    if (value && !isNaN(Number.parseFloat(value))) {
      const numValue = Number.parseFloat(value)
      if (numValue >= 0 && numValue <= 3000) {
        setSliderValue(numValue)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Budget Estimate (in millions)</span>
          <span className="font-medium text-white">${sliderValue}M</span>
        </div>

        <Slider
          value={[sliderValue]}
          min={0}
          max={300}
          step={1}
          onValueChange={handleSliderChange}
          disabled={submitted || loading}
          className="py-4"
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>$0M</span>
          <span>$150M</span>
          <span>$300M</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="number"
            value={guess}
            onChange={handleInputChange}
            className="pl-9 bg-gray-700 border-gray-600 text-white"
            placeholder="Enter budget in millions"
            min="0"
            max="3000"
            disabled={submitted || loading}
          />
        </div>

        <Button
          type="submit"
          disabled={submitted || loading || !guess}
          className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 ${
            submitted || loading || !guess ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            "Submit Guess"
          )}
        </Button>
      </div>

      <div className="text-xs text-gray-400 text-center">Enter your guess between $0-3000 million</div>
    </form>
  )
}
