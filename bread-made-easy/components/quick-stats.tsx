"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gavel, ShoppingBag, MessageSquare, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface StatCardProps {
  title: string
  value: string | number
  subtext?: string
  icon: React.ReactNode
}

function StatCard({ title, value, subtext, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext ? <p className="text-xs text-muted-foreground">{subtext}</p> : null}
      </CardContent>
    </Card>
  )
}

export function QuickStats() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const [activeBids, setActiveBids] = useState<number>(0)
  const [winningBids, setWinningBids] = useState<number>(0)
  const [purchasesCount, setPurchasesCount] = useState<number>(0)
  const [purchasesTotal, setPurchasesTotal] = useState<number>(0)
  const [customCount, setCustomCount] = useState<number>(0)
  const [customInProgress, setCustomInProgress] = useState<number>(0)
  const [successRate, setSuccessRate] = useState<number>(0)

  // Fetch initial values
  useEffect(() => {
    if (!userId) return

    const load = async () => {
      // Active bids: count of user's bids on auctions that are currently active
      const nowIso = new Date().toISOString()

      const [{ data: userBids }, { data: activeAuctions }] = await Promise.all([
        supabase.from("bids").select("id, auction_id, status").eq("bidder_id", userId),
        supabase
          .from("auctions")
          .select("id, status, winning_bid_id")
          .eq("status", "active")
          .gte("ends_at", nowIso),
      ])

      const activeAuctionIds = new Set((activeAuctions || []).map((a: any) => a.id))
      const bidsOnActive = (userBids || []).filter((b: any) => activeAuctionIds.has(b.auction_id))
      setActiveBids(bidsOnActive.length)

      const winning = (activeAuctions || []).filter((a: any) =>
        (userBids || []).some((b: any) => b.id === a.winning_bid_id)
      ).length
      setWinningBids(winning)

      // Purchases: count all purchases; total spent from completed ones
      // Fetch a window of recent purchases and filter client-side by buyer_id to be resilient to RLS
      const { data: purchases } = await supabase
        .from("purchases")
        .select("amount, payment_status, buyer_id")
        .order("created_at", { ascending: false })
        .limit(200)

      const pList = (purchases || []).filter((p: any) => p.buyer_id === userId)
      setPurchasesCount(pList.length)
      const paidStatuses = new Set(["completed", "succeeded", "paid"]) // handle enum variants
      setPurchasesTotal(
        pList
          .filter((p: any) => paidStatuses.has(String(p.payment_status)))
          .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
      )

      // Custom requests by email
      const { data: cr } = await supabase
        .from("custom_requests")
        .select("status")
        .eq("email", user?.email || "")

      const crList = cr || []
      setCustomCount(crList.length)
      const normalize = (s: any) => String(s || "").toLowerCase().replace(/\s+/g, "_")
      const inProgressStatuses = new Set(["in_progress", "reviewing", "approved", "pending", "active"]) // treat these as in-progress
      setCustomInProgress(
        crList.filter((c: any) => inProgressStatuses.has(normalize(c.status))).length
      )

      // Success rate: simple win rate across auctions user bid on and have ended
      const { data: endedAuctions } = await supabase
        .from("auctions")
        .select("id, winning_bid_id, status")
        .in("status", ["ended", "closed"])

      const auctionsBidOn = (userBids || []).reduce((set: Set<string>, b: any) => set.add(b.auction_id), new Set<string>())
      const endedWhereBid = (endedAuctions || []).filter((a: any) => auctionsBidOn.has(a.id))
      const wins = endedWhereBid.filter((a: any) => (userBids || []).some((b: any) => b.id === a.winning_bid_id)).length
      const rate = endedWhereBid.length ? Math.round((wins / endedWhereBid.length) * 100) : 0
      setSuccessRate(rate)
    }

    load()

    // Realtime subscriptions
    const bidsCh = supabase
      .channel("qs-bids")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids", filter: `bidder_id=eq.${userId}` }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bids", filter: `bidder_id=eq.${userId}` }, () => load())
      .subscribe()

    const purchasesCh = supabase
      .channel("qs-purchases")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "purchases" }, (payload) => {
        if ((payload.new as any)?.buyer_id === userId) load()
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "purchases" }, (payload) => {
        if ((payload.new as any)?.buyer_id === userId) load()
      })
      .subscribe()

    const crCh = supabase
      .channel("qs-cr")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "custom_requests", filter: `email=eq.${user?.email || ""}` }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "custom_requests", filter: `email=eq.${user?.email || ""}` }, () => load())
      .subscribe()

    const auctionsCh = supabase
      .channel("qs-auctions")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "auctions" }, () => load())
      .subscribe()

    return () => {
      supabase.removeChannel(bidsCh)
      supabase.removeChannel(purchasesCh)
      supabase.removeChannel(crCh)
      supabase.removeChannel(auctionsCh)
    }
  }, [userId, user?.email])

  const purchasesSubtext = useMemo(() => {
    return `${new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" }).format(purchasesTotal)} total spent`
  }, [purchasesTotal])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Active Bids" value={activeBids} subtext={`${winningBids} winning bids`} icon={<Gavel className="h-4 w-4 text-muted-foreground" />} />
      <StatCard title="Purchases" value={purchasesCount} subtext={purchasesSubtext} icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />} />
      <StatCard title="Custom Requests" value={customCount} subtext={`${customInProgress} in progress`} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} />
      <StatCard title="Success Rate" value={`${successRate}%`} subtext="Auction win rate" icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
    </div>
  )
}


