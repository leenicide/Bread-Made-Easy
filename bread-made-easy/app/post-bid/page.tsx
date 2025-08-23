import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Crown, Zap, TrendingUp, Shield, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BidConfirmationPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Navigation back to auction */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/auctions">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Auction
              </Link>
            </Button>
          </div>

          {/* Headline */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Your Bid Is In. But Why Wait to Find Out If You've Won?
            </h1>
            <p className="text-lg text-muted-foreground">
              The clock is ticking, and when the auction ends, only one winner will own this Wealth Oven™.
            </p>
          </div>

          {/* Make an Offer Section - Highlighted */}
          <Card className="mb-8 border-blue-300 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-blue-800">Make Us an Offer - Skip the Wait!</CardTitle>
              </div>
              <CardDescription className="text-blue-700">
                Money now is better than money later. Make us an offer we can't refuse and secure your Wealth Oven today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-blue-800">
                <p>
                  The more you offer, the higher your chances of securing the Wealth Oven immediately. 
                  We're looking for offers of at least $10,000 to consider ending the auction early.
                </p>
                <p className="font-semibold">
                  Keep increasing your offer until we accept - you could own this Wealth Oven within hours, not days!
                </p>
                <div className="pt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/make-offer">Make Us an Offer Now</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options for Action-Takers */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">Other Options If Your Offer Isn't Accepted</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Custom Wealth Oven Card */}
              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Custom Wealth Oven™</CardTitle>
                  <CardDescription>
                    Want something even bigger? Apply for a custom build.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This is the elite path: tailored design, private consults, maximum ROI. Only a handful accepted each quarter.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/custom-request">Apply for Custom Build</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Lease Option Card */}
              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Wealth Oven Leases</CardTitle>
                  <CardDescription>
                    Not ready for full ownership? Start small with our Lease Program.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Low risk, high performance, with the option to buy later. Entry-level, no risk, aligned success.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/lease">Lease a Wealth Oven</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Urgency Reminder */}
          <Card className="border-destructive/20 bg-destructive/5 mb-12">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Urgency Reminder</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Remember: this auction ends soon. If you win, you'll own the Wealth Oven forever. 
                  If you lose, it's gone — permanently.
                </p>
                <p className="font-semibold">
                  Don't leave your future up to chance. Make us an offer now to secure your Wealth Oven today.
                </p>
              </div>
            </CardContent>
          </Card>


         
        </div>
      </main>
    </div>
  )
}