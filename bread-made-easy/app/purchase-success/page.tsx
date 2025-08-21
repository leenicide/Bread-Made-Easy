"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UpsellOffers } from "@/components/upsell/upsell-offers"
import { paymentService } from "@/lib/payment-service"
import type { Purchase } from "@/lib/types"
import { CheckCircle, Download, Mail, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams()
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpsells, setShowUpsells] = useState(true)

  const purchaseId = searchParams.get("purchaseId")

  useEffect(() => {
    const fetchPurchase = async () => {
      if (purchaseId) {
        try {
          const purchaseData = await paymentService.getPurchase(purchaseId)
          setPurchase(purchaseData)
        } catch (error) {
          console.error("Failed to fetch purchase:", error)
        }
      }
      setLoading(false)
    }

    fetchPurchase()
  }, [purchaseId])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Purchase Not Found</h1>
            <p className="text-muted-foreground">We couldn't find your purchase information.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">Thank you for your purchase. Your funnel is ready for download.</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
              <CardDescription>
                Order #{purchase.id} • {purchase.createdAt.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Amount Paid</span>
                <span className="font-semibold text-lg">${purchase.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Purchase Type</span>
                <Badge variant="secondary">
                  {purchase.type === "buy_now"
                    ? "Buy Now"
                    : purchase.type === "auction_win"
                      ? "Auction Win"
                      : "Direct Sale"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant="default">{purchase.status === "completed" ? "Completed" : purchase.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment ID</span>
                <span className="text-sm text-muted-foreground font-mono">{purchase.stripePaymentIntentId}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Download Your Funnel</h3>
                    <p className="text-sm text-muted-foreground">Complete source code, assets, and documentation</p>
                  </div>
                  <Button>Download Now</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Setup Documentation</h3>
                    <p className="text-sm text-muted-foreground">Step-by-step installation and configuration guide</p>
                  </div>
                  <Button variant="outline" className="bg-transparent">
                    View Docs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">30-Day Support</h3>
                    <p className="text-sm text-muted-foreground">Get help with setup and customization</p>
                  </div>
                  <Button variant="outline" className="bg-transparent">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {showUpsells && (
            <>
              <Separator />
              <UpsellOffers purchaseType={purchase.type} purchaseAmount={purchase.amount} />
              <Separator />
            </>
          )}
          {/* </CHANGE> */}

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              A confirmation email has been sent to your registered email address.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/auctions">
                  Browse More Funnels
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
