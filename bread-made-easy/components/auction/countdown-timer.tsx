"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  endTime: Date
  onExpire?: () => void
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

export function CountdownTimer({ endTime, onExpire }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const end = endTime.getTime()
      const difference = end - now

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        })
        onExpire?.()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeRemaining({ days, hours, minutes, seconds, expired: false })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [endTime, onExpire])

  if (timeRemaining.expired) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Auction Ended</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-orange-500" />
      <div className="flex items-center gap-1 font-mono">
        {timeRemaining.days > 0 && (
          <>
            <span className="bg-muted px-2 py-1 rounded text-sm font-bold">
              {timeRemaining.days.toString().padStart(2, "0")}
            </span>
            <span className="text-muted-foreground">d</span>
          </>
        )}
        <span className="bg-muted px-2 py-1 rounded text-sm font-bold">
          {timeRemaining.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-muted px-2 py-1 rounded text-sm font-bold">
          {timeRemaining.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-muted px-2 py-1 rounded text-sm font-bold">
          {timeRemaining.seconds.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  )
}
