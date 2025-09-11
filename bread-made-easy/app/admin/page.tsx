"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCards } from "@/components/admin/stats-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { adminService } from "@/lib/admin-service"
import { userService } from "@/lib/user-service"
import { bidService } from "@/lib/bid-service"
import { auctionService } from "@/lib/auction-service"
import { purchaseService, PurchaseWithDetails } from "@/lib/purchase-service"
import { supabase } from "@/lib/supabase-client"
import type { Purchase, CustomRequest, User, Bid, Auction } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { Eye, DollarSign, Clock, MessageSquare, Activity, Gavel, Users, Plus, Minus, User as UserIcon, X, RefreshCw } from "lucide-react"

interface ActivityEvent {
  id: string
  type: 'auction' | 'bid' | 'funnel' | 'user' | 'lead' | 'purchase' | 'custom_request'
  action: string
  title: string
  description: string
  timestamp: Date
  metadata?: any
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([])
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [recentBids, setRecentBids] = useState<Bid[]>([])
  const [allBids, setAllBids] = useState<Bid[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([])
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [showBidsModal, setShowBidsModal] = useState(false)

  const fetchData = async () => {
    try {
      const [purchasesData, requestsData, usersData, auctionsData] = await Promise.all([
        purchaseService.getPurchases(),
        adminService.getCustomRequests(),
        userService.getAllUsers(),
        auctionService.getAuctions(),
      ])

      // Calculate stats
      const completedPurchases = purchasesData.filter(p => 
        p.payment_status === 'completed' || p.payment_status === 'succeeded' || p.payment_status === 'paid'
      );
      
      // Debug log to check purchases data
      console.log("Purchases data:", purchasesData);
      console.log("Completed purchases:", completedPurchases);
      
      const totalRevenue = completedPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyRevenue = completedPurchases
        .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Get active auctions
      const activeAuctionsData = auctionsData.filter(auction => 
        auction.status === 'active'
      );

      // Create stats object
      const statsData = {
        totalRevenue,
        monthlyRevenue,
        totalUsers: usersData.length,
        totalAuctions: auctionsData.length,
        activeAuctions: activeAuctionsData.length,
        totalPurchases: purchasesData.length,
        totalBids: 0,
        totalLeads: 0,
        totalRequests: requestsData.length,
      };

      setStats(statsData)
      setRecentPurchases(purchasesData.slice(0, 5))
      setCustomRequests(requestsData)
      setAllUsers(usersData)
      setAuctions(auctionsData)
      setActiveAuctions(activeAuctionsData)

      // Fetch all bids
      try {
        const allBidsData = await adminService.getAllBids();
        setAllBids(allBidsData);
        setStats((prev: any) => ({...prev, totalBids: allBidsData.length}));
        
        const sortedBids = allBidsData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5);
        
        setRecentBids(sortedBids);
      } catch (error) {
        console.error("Error fetching bids:", error);
      }

      // Generate activities
      const generatedActivities = await generateActivities(
        statsData,
        purchasesData.slice(0, 5),
        requestsData,
        usersData,
        recentBids,
        activeAuctionsData
      )
      setActivities(generatedActivities)
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!stats) return;
    
    const channel = supabase.channel('admin-dashboard-updates');
    
    // Purchase updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'purchases'
      },
      async (payload) => {
        const purchasesData = await purchaseService.getPurchases();
        setRecentPurchases(purchasesData.slice(0, 5));
        
        const completedPurchases = purchasesData.filter(p => 
          p.payment_status === 'completed' || p.payment_status === 'succeeded' || p.payment_status === 'paid'
        );
        
        const totalRevenue = completedPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyRevenue = completedPurchases
          .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        setStats((prev: any) => ({
          ...prev,
          totalRevenue,
          monthlyRevenue,
          totalPurchases: purchasesData.length
        }));
        
        if (payload.eventType === 'INSERT') {
          const newActivity: ActivityEvent = {
            id: `purchase_${payload.new.id}`,
            type: 'purchase',
            action: 'completed',
            title: 'New Purchase',
            description: `Purchase of $${payload.new.amount} completed`,
            timestamp: new Date(payload.new.created_at),
            metadata: { purchase: payload.new }
          };
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }
      }
    ).subscribe();
    
    // Custom request updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'custom_requests'
      },
      async (payload) => {
        const requestsData = await adminService.getCustomRequests();
        setCustomRequests(requestsData);
        setStats((prev: any) => ({...prev, totalRequests: requestsData.length}));
        
        if (payload.eventType === 'INSERT') {
          const newActivity: ActivityEvent = {
            id: `request_${payload.new.id}`,
            type: 'custom_request',
            action: 'created',
            title: 'New Custom Request',
            description: `${payload.new.name} submitted a request for ${payload.new.projecttype}`,
            timestamp: new Date(payload.new.created_at),
            metadata: { request: payload.new }
          };
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }
      }
    ).subscribe();
    
    // Bid updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bids'
      },
      async (payload) => {
        try {
          const allBidsData = await adminService.getAllBids();
          setAllBids(allBidsData);
          setStats((prev: any) => ({...prev, totalBids: allBidsData.length}));
          
          const sortedBids = allBidsData.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 5);
          
          setRecentBids(sortedBids);
          
          if (payload.eventType === 'INSERT') {
            const newActivity: ActivityEvent = {
              id: `bid_${payload.new.id}`,
              type: 'bid',
              action: 'created',
              title: 'New Bid Placed',
              description: `Bid of $${payload.new.amount} placed on auction`,
              timestamp: new Date(payload.new.created_at),
              metadata: { bid: payload.new }
            };
            setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
          }
        } catch (error) {
          console.error("Error fetching bids:", error);
        }
      }
    ).subscribe();
    
    // Auction updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'auctions'
      },
      async (payload) => {
        const auctionsData = await auctionService.getAuctions();
        setAuctions(auctionsData);
        
        const activeAuctionsData = auctionsData.filter(auction => 
          auction.status === 'active'
        );
        setActiveAuctions(activeAuctionsData);
        
        setStats((prev: any) => ({
          ...prev,
          totalAuctions: auctionsData.length,
          activeAuctions: activeAuctionsData.length
        }));
        
        if (payload.eventType === 'INSERT') {
          const newActivity: ActivityEvent = {
            id: `auction_${payload.new.id}`,
            type: 'auction',
            action: 'created',
            title: 'New Auction Created',
            description: `Auction "${payload.new.title}" created`,
            timestamp: new Date(payload.new.created_at),
            metadata: { auction: payload.new }
          };
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }
      }
    ).subscribe();
    
    // User updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles'
      },
      async (payload) => {
        const usersData = await userService.getAllUsers();
        setAllUsers(usersData);
        setStats((prev: any) => ({...prev, totalUsers: usersData.length}));
        
        if (payload.eventType === 'INSERT') {
          const newActivity: ActivityEvent = {
            id: `user_${payload.new.id}`,
            type: 'user',
            action: 'created',
            title: 'New User Signup',
            description: `${payload.new.display_name || 'New user'} signed up`,
            timestamp: new Date(payload.new.created_at),
            metadata: { user: payload.new }
          };
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stats]);

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const generateActivities = async (
    statsData: any,
    purchasesData: Purchase[],
    requestsData: CustomRequest[],
    usersData: User[],
    bidsData: Bid[],
    activeAuctionsData: Auction[]
  ): Promise<ActivityEvent[]> => {
    const activities: ActivityEvent[] = []

    // User signup activities
    const recentUsers = usersData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
    
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user',
        action: 'created',
        title: 'New User Signup',
        description: `${user.display_name || 'New user'} signed up`,
        timestamp: new Date(user.created_at),
        metadata: { user }
      })
    })

    // Bid activities
    bidsData.forEach(bid => {
      activities.push({
        id: `bid_${bid.id}`,
        type: 'bid',
        action: 'created',
        title: 'New Bid Placed',
        description: `Bid of $${bid.amount} placed on auction`,
        timestamp: new Date(bid.created_at),
        metadata: { bid }
      })
    })

    // Purchase activities
    purchasesData.slice(0, 3).forEach(purchase => {
      activities.push({
        id: `purchase_${purchase.id}`,
        type: 'purchase',
        action: 'completed',
        title: 'New Purchase',
        description: `Purchase of $${purchase.amount} completed`,
        timestamp: new Date(purchase.created_at),
        metadata: { purchase }
      })
    })

    // Active auction activities
    activeAuctionsData.slice(0, 3).forEach(auction => {
      activities.push({
        id: `auction_${auction.id}`,
        type: 'auction',
        action: 'active',
        title: 'Active Auction',
        description: `Auction "${auction.title}" is active with starting price $${auction.starting_price}`,
        timestamp: new Date(auction.created_at),
        metadata: { auction }
      })
    })

    // Custom request activities
    requestsData.slice(0, 3).forEach(request => {
      activities.push({
        id: `request_${request.id}`,
        type: 'custom_request',
        action: 'created',
        title: 'New Custom Request',
        description: `${request.name} submitted a request for ${request.projecttype}`,
        timestamp: new Date(request.created_at),
        metadata: { request }
      })
    })

    // Sort by timestamp and limit to 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'auction': return <Gavel className="h-4 w-4" />
      case 'bid': return <DollarSign className="h-4 w-4" />
      case 'funnel': return <Activity className="h-4 w-4" />
      case 'user': return <UserIcon className="h-4 w-4" />
      case 'lead': return <Users className="h-4 w-4" />
      case 'purchase': return <DollarSign className="h-4 w-4" />
      case 'custom_request': return <MessageSquare className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="h-3 w-3 text-green-500" />
      case 'deleted': return <Minus className="h-3 w-3 text-red-500" />
      case 'updated': return <Activity className="h-3 w-3 text-blue-500" />
      default: return <Activity className="h-3 w-3" />
    }
  }

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your marketplace performance</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {stats && <StatsCards stats={stats} />}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
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
                        {purchase.note === "buy_now"
                          ? "Buy Now"
                          : purchase.note === "auction"
                            ? "Auction"
                            : "Direct"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(purchase.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Badge variant={purchase.payment_status === "completed" ? "default" : "secondary"}>
                      {purchase.payment_status}
                    </Badge>
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
                {customRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-1">{request.projecttype}</h4>
                      <Badge
                        variant={
                          request.status === "pending"
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
                    <p className="text-xs text-muted-foreground line-clamp-2">{request.additionalnotes || "No description"}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">${request.budget}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent"
                  onClick={() => setShowRequestsModal(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bids Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Recent Bids
              </CardTitle>
              <CardDescription>Latest bids placed on auctions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBids.map((bid) => {
                  const auction = auctions.find(a => a.id === bid.auction_id);
                  return (
                    <div key={bid.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">${bid.amount}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Bid
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {auction && (
                          <p className="text-xs text-muted-foreground">
                            On: {auction.title || `Auction ${auction.id.slice(0, 8)}`}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        By: {bid.bidder?.display_name || "Unknown"}
                      </Badge>
                    </div>
                  )
                })}
                {recentBids.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No recent bids</p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent"
                  onClick={() => setShowBidsModal(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Bids
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Real-time updates from your database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{activity.title}</span>
                        <span className="flex items-center gap-1">
                          {getActionIcon(activity.action)}
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Requests Modal */}
        <Dialog open={showRequestsModal} onOpenChange={setShowRequestsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Custom Requests</DialogTitle>
              <DialogDescription>
                Complete list of all custom project requests from clients
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {customRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{request.projecttype}</h4>
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "destructive"
                          : request.status === "in_progress"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {request.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Client: {request.name}</p>
                    <p className="text-sm text-muted-foreground">Email: {request.email}</p>
                    <p className="text-sm text-muted-foreground">Phone: {request.phone || "Not provided"}</p>
                  </div>
                  {request.additionalnotes && (
                    <div>
                      <p className="text-sm font-medium">Notes:</p>
                      <p className="text-sm text-muted-foreground">{request.additionalnotes}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Budget: ${request.budget}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
              {customRequests.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No custom requests</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* All Bids Modal */}
        <Dialog open={showBidsModal} onOpenChange={setShowBidsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Bids</DialogTitle>
              <DialogDescription>
                Complete list of all bids placed on auctions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {allBids.map((bid) => {
                const auction = auctions.find(a => a.id === bid.auction_id);
                return (
                  <div key={bid.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-lg">${bid.amount}</p>
                      <Badge variant="secondary">Bid</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bidder: {bid.bidder?.display_name || "Unknown"}</p>
                      {auction && (
                        <p className="text-sm text-muted-foreground">
                          Auction: {auction.title || `Auction ${auction.id.slice(0, 8)}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                      </span>
                      <Badge variant="outline">
                        Status: {bid.status || "Active"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
              {allBids.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No bids found</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}