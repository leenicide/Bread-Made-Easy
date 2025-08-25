"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Bid } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { TrendingUp, Users } from "lucide-react"

interface BidHistoryProps {
  bids: Bid[]
}

export function BidHistory({ bids }: BidHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Bid History
          <Badge variant="secondary" className="ml-auto">
            <Users className="h-3 w-3 mr-1" />
            {bids.length} bids
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bids.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No bids yet. Be the first to bid!</p>
        ) : (
          <div className="space-y-3">
            {bids.map((bid, index) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0 ? "bg-green-50 border-green-200" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {bid.bidder_id?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">${bid.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <Badge variant="default" className="text-xs">
                      Winning
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">#{bids.length - index}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}