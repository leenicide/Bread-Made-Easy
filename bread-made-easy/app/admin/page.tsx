"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCards } from "@/components/admin/stats-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { adminService } from "@/lib/admin-service"
import type { Purchase, CustomRequest } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { Eye, DollarSign, Clock, MessageSquare } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([])
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, purchasesData, requestsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentPurchases(),
          adminService.getCustomRequests(),
        ])

        setStats(statsData)
        setRecentPurchases(purchasesData)
        setCustomRequests(requestsData)
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your marketplace performance</p>
        </div>

        {stats && <StatsCards stats={stats} />}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Recent Purchases
              </CardTitle>
              <CardDescription>Latest transactions and sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">${purchase.amount}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {purchase.type === "buy_now"
                            ? "Buy Now"
                            : purchase.type === "auction_win"
                              ? "Auction"
                              : "Direct"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(purchase.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>{purchase.status}</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Purchases
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Custom Requests
              </CardTitle>
              <CardDescription>Recent project requests from clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customRequests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-1">{request.title}</h4>
                      <Badge
                        variant={
                          request.status === "open"
                            ? "destructive"
                            : request.status === "in_progress"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {request.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">${request.budget}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
