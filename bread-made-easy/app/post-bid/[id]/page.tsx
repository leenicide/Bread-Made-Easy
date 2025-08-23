"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Shield, Zap, Clock, Lock, Mail } from "lucide-react"
import Link from "next/link"

export default function BidConfirmationPage() {
  const params = useParams()
  const auctionId = params.id as string
  const [offerAmount, setOfferAmount] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{success: boolean; message: string} | null>(null)

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      const amount = Number(offerAmount)
      if (amount >= 10000) {
        setSubmissionResult({
          success: true,
          message: "Offer submitted! Our team will review it within 24 hours and contact you at the email provided."
        })
      } else {
        setSubmissionResult({
          success: false,
          message: `Your offer of $${offerAmount} is below our minimum threshold. Please consider increasing your offer to at least $10,000.`
        })
      }
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Skip the Auction. Name Your Price. Own Your Wealth Oven Today.
            </h1>
            <p className="text-lg text-muted-foreground">
              Why wait to see if you'll win? If your offer is accepted, this Wealth Oven is yours — instantly.
            </p>
          </div>

          {/* Why Make an Offer Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Why Make an Offer?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Here's the truth: auctions are exciting… but they're also uncertain.
                When the clock runs out, only one winner takes it all. And if you're not that person, 
                the Wealth Oven you wanted is gone forever.
              </p>
              <p>
                Making an offer lets you cut the line.
                No bidding wars.
                No last-minute sniping.
                No waiting for a timer to hit zero.
              </p>
              <p className="font-semibold">
                👉 If your offer is accepted, you lock in ownership today.
              </p>
            </CardContent>
          </Card>

          {/* The Power of Direct Ownership Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>The Power of Direct Ownership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Every Wealth Oven™ is 1-of-1. Unique. Exclusive. Never repeated.
                When you submit an offer, you're not buying a template. You're claiming a business machine that:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Is fully built and ready to deploy.</li>
                <li>Has proven conversion principles baked in.</li>
                <li>Belongs to you — and only you.</li>
              </ul>
              <p className="font-semibold">Once it's yours, it's yours forever.</p>
            </CardContent>
          </Card>

          {/* How It Works Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-5 space-y-3">
                <li className="font-medium">Submit your offer today.</li>
                <li className="font-medium">Our team reviews it within 24 hours.</li>
                <li className="font-medium">If accepted, the Oven is immediately assigned to you.</li>
                <li className="font-medium">We guide you through setup and launch.</li>
              </ol>
              <p className="font-semibold">It's that simple.</p>
            </CardContent>
          </Card>

          {/* Trust & Exclusivity Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Trust & Exclusivity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>All payments are handled securely through Stripe.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Every Wealth Oven is exclusive — no duplicates, no reruns.</p>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Support is built in — you're never left alone.</p>
              </div>
              <p className="font-semibold">
                This is your chance to lock in ownership before anyone else can.
              </p>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle>Submit My Offer Now</CardTitle>
              <CardDescription>
                Enter your best offer + contact info. Our team will respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionResult ? (
                <div className={`p-4 rounded-lg ${submissionResult.success ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                  <p className={submissionResult.success ? 'text-green-800' : 'text-amber-800'}>
                    {submissionResult.message}
                  </p>
                  {!submissionResult.success && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setSubmissionResult(null)}
                    >
                      Try Again with Higher Offer
                    </Button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitOffer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="offerAmount">Your Best Offer</Label>
                    <Input
                      id="offerAmount"
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Enter your offer amount"
                      min="1000"
                      step="1000"
                      required
                    />
                  </div>
                
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting Offer..." : "Submit My Offer Now"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Serious buyers only. Remember: once this Wealth Oven is claimed, it will never be available again.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Urgency Reminder */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-destructive" />
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