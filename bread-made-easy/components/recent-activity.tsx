"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gavel, MessageSquare, ShoppingBag } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import type { PurchaseWithDetails, Bid, CustomRequest } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

type ActivityItem = {
  id: string
  type: "purchase" | "bid" | "custom_request" | "won_auction"
  title: string
  subtitle: string
  statusBadge: { label: string; variant?: "default" | "secondary" | "outline" | "destructive" }
  created_at: string | Date
  icon: "purchase" | "bid" | "custom" | "won"
}

interface RecentActivityProps { userId?: string; limit?: number }

export function RecentActivity({ userId, limit = 10 }: RecentActivityProps) {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [wonAuctions, setWonAuctions] = useState<{ id: string; title?: string; created_at: string | Date }[]>([])
  const { user } = useAuth()

  const effectiveUserId = userId || user?.id || ""
  const userEmail = user?.email || ""

  useEffect(() => {
    if (!effectiveUserId) return

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [{ data: purchaseData }, { data: bidsData }, { data: crData }] = await Promise.all([
          supabase
            .from("purchases")
            .select("*")
            .eq("buyer_id", effectiveUserId)
            .order("created_at", { ascending: false })
            .limit(limit),
          supabase
            .from("bids")
            .select("*")
            .eq("bidder_id", effectiveUserId)
            .order("created_at", { ascending: false })
            .limit(limit),
          supabase
            .from("custom_requests")
            .select("*")
            .eq("email", userEmail)
            .order("created_at", { ascending: false })
            .limit(limit),
        ])

        setPurchases((purchaseData as PurchaseWithDetails[]) || [])
        setBids((bidsData as Bid[]) || [])
        setCustomRequests((crData as CustomRequest[]) || [])

        // Seed won auctions: find auctions whose winning_bid_id is among user's bid ids
        const bidIds = (bidsData || []).map((b: any) => b.id)
        if (bidIds.length > 0) {
          const { data: won } = await supabase
            .from("auctions")
            .select("id,title,updated_at,winning_bid_id")
            .in("winning_bid_id", bidIds)
            .order("updated_at", { ascending: false })
            .limit(limit)
          setWonAuctions(
            (won || []).map((a: any) => ({ id: a.id, title: a.title, created_at: a.updated_at }))
          )
        } else {
          setWonAuctions([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAll()

    // Realtime subscriptions
    const purchaseSub = supabase
      .channel("recent-activity-purchases")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "purchases", filter: `buyer_id=eq.${effectiveUserId}` },
        (payload) => setPurchases((curr) => [payload.new as PurchaseWithDetails, ...curr].slice(0, limit))
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "purchases", filter: `buyer_id=eq.${effectiveUserId}` },
        (payload) =>
          setPurchases((curr) => {
            const updated = curr.map((p) => (p.id === (payload.new as any).id ? (payload.new as PurchaseWithDetails) : p))
            return updated
          })
      )
      .subscribe()

    const bidSub = supabase
      .channel("recent-activity-bids")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids", filter: `bidder_id=eq.${effectiveUserId}` },
        (payload) => setBids((curr) => [payload.new as Bid, ...curr].slice(0, limit))
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bids", filter: `bidder_id=eq.${effectiveUserId}` },
        (payload) =>
          setBids((curr) => curr.map((b) => (b.id === (payload.new as any).id ? (payload.new as Bid) : b)))
      )
      .subscribe()

    const crSub = supabase
      .channel("recent-activity-cr")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "custom_requests", filter: `email=eq.${userEmail}` },
        (payload) => setCustomRequests((curr) => [payload.new as CustomRequest, ...curr].slice(0, limit))
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "custom_requests", filter: `email=eq.${userEmail}` },
        (payload) =>
          setCustomRequests((curr) =>
            curr.map((c) => (c.id === (payload.new as any).id ? (payload.new as CustomRequest) : c))
          )
      )
      .subscribe()

    // Auctions: detect wins for this user's bids
    const auctionsSub = supabase
      .channel("recent-activity-auctions")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auctions" },
        async (payload) => {
          const newRow: any = payload.new
          const winningBidId = newRow?.winning_bid_id
          if (!winningBidId) return
          // Check if winning bid belongs to the user
          const { data: bid } = await supabase
            .from("bids")
            .select("id,bidder_id")
            .eq("id", winningBidId)
            .single()
          if (bid?.bidder_id === effectiveUserId) {
            setWonAuctions((curr) => {
              if (curr.some((w) => w.id === newRow.id)) return curr
              return [{ id: newRow.id, title: newRow.title, created_at: newRow.updated_at || new Date().toISOString() }, ...curr].slice(0, limit)
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(purchaseSub)
      supabase.removeChannel(bidSub)
      supabase.removeChannel(crSub)
      supabase.removeChannel(auctionsSub)
    }
  }, [effectiveUserId, userEmail, limit])

  const items: ActivityItem[] = useMemo(() => {
    const purchaseItems: ActivityItem[] = purchases.map((p) => ({
      id: p.id,
      type: "purchase",
      title: p.note === "auction" ? `Purchased Auction` : `Purchased ${p.funnel_title ?? "Funnel"}`,
      subtitle: `${new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" }).format(p.amount)} • ${formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}`,
      statusBadge: { label: p.payment_status, variant: p.payment_status === "completed" ? "default" : p.payment_status === "pending" ? "secondary" : "destructive" },
      created_at: p.created_at,
      icon: "purchase",
    }))

    const bidItems: ActivityItem[] = bids.map((b) => ({
      id: b.id,
      type: "bid",
      title: `Placed a bid`,
      subtitle: `${new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" }).format(b.amount)} • ${formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}`,
      statusBadge: { label: b.status ?? "pending", variant: b.status === "winning" ? "secondary" : "outline" },
      created_at: b.created_at,
      icon: "bid",
    }))

    const crItems: ActivityItem[] = customRequests.map((c) => ({
      id: c.id,
      type: "custom_request",
      title: c.projecttype || "Custom Request",
      subtitle: `${c.status} • ${formatDistanceToNow(new Date(c.submitted_at), { addSuffix: true })}`,
      statusBadge: { label: c.status, variant: c.status === "completed" ? "default" : c.status === "in_progress" ? "secondary" : "outline" },
      created_at: c.created_at,
      icon: "custom",
    }))

    const wonItems: ActivityItem[] = wonAuctions.map((a) => ({
      id: a.id,
      type: "won_auction",
      title: `Won auction${a.title ? `: ${a.title}` : ""}`,
      subtitle: `${formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}`,
      statusBadge: { label: "Won", variant: "default" },
      created_at: a.created_at,
      icon: "won",
    }))

    return [...purchaseItems, ...bidItems, ...crItems, ...wonItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }, [purchases, bids, customRequests, wonAuctions, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest marketplace interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No recent activity yet.</div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.icon === "purchase" ? "bg-green-100" : item.icon === "bid" ? "bg-blue-100" : item.icon === "custom" ? "bg-orange-100" : "bg-purple-100"}`}>
                {item.icon === "purchase" && <ShoppingBag className="h-5 w-5 text-green-600" />}
                {item.icon === "bid" && <Gavel className="h-5 w-5 text-blue-600" />}
                {item.icon === "custom" && <MessageSquare className="h-5 w-5 text-orange-600" />}
                {item.icon === "won" && <Gavel className="h-5 w-5 text-purple-700" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <Badge variant={item.statusBadge.variant || "outline"}>{item.statusBadge.label}</Badge>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button asChild variant="outline" className="w-full bg-transparent"><Link href="/dashboard/activity">View All Activity</Link></Button>
        </div>
      </CardContent>
    </Card>
  )
}


