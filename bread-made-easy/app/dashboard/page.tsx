import { Header } from "@/components/header"
import { RequestTracker } from "@/components/custom-request/request-tracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gavel, ShoppingBag, MessageSquare, Download, TrendingUp } from "lucide-react"
import Link from "next/link"
import { RecentActivity } from "@/components/recent-activity"

function DashboardContent() {

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your purchases, bids, and custom requests</p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
                <Gavel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">2 winning bids</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Purchases</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">$4,250 total spent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custom Requests</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">1 in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Auction win rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <RecentActivity limit={5} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                <Button asChild variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <Link href="/auctions">
                      <Gavel className="h-5 w-5 mr-3" />
               
                      <div className="text-left">
                        <div className="font-medium">Browse Auctions</div>
                        <div className="text-xs text-muted-foreground">Find and bid on exclusive funnels</div>
                      </div>
                    </Link>
                  </Button>

                  {/* <Button asChild variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <Link href="/buy-now">
                      <ShoppingBag className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Buy Now Funnels</div>
                        <div className="text-xs text-muted-foreground">Instant access to ready-made funnels</div>
                      </div>
                    </Link>
                  </Button> */}

                  <Button asChild variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <Link href="/custom-request">
                      <MessageSquare className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Custom Request</div>
                        <div className="text-xs text-muted-foreground">Get a funnel built just for you</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <Link href="/downloads">
                      <Download className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">My Downloads</div>
                        <div className="text-xs text-muted-foreground">Access your purchased funnels</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Requests Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Custom Requests</h2>
              <Button asChild>
                <Link href="/custom-request">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Request
                </Link>
              </Button>
            </div>
            <RequestTracker userId={"dashboard"} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}
