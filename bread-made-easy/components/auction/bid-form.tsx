"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { auctionService } from "@/lib/auction-service";
import type { Auction } from "@/lib/types";
import { Gavel, Zap, TrendingUp, Loader2, Shield, Lock, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentModal } from "@/components/payment/payment-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BidFormProps {
  auction: Auction;
  onBidPlaced: (updatedAuction: Auction) => void;
  onBuyNow: (updatedAuction: Auction) => void;
  redirecting?: boolean;
}

export function BidForm({
  auction,
  onBidPlaced,
  onBuyNow,
  redirecting,
}: BidFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastBid, setLastBid] = useState<{
    bidId: string;
    amount: number;
  } | null>(null);

  // Calculate minimum bid with proper type handling
  const currentPrice =
    Number(auction.current_price) || Number(auction.starting_price);
  const minBid = Math.max(currentPrice + 25, Number(auction.starting_price));

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const amount = Number.parseFloat(bidAmount);
      if (isNaN(amount) || amount < minBid) {
        setError(`Bid must be at least $${minBid}`);
        return;
      }

      const response = await auctionService.placeBid(
        auction.id,
        user.id,
        amount
      );

      if (response.success && response.auction && response.bidId) {
        setSuccess(`Bid placed successfully!`);
        setBidAmount("");
        onBidPlaced(response.auction);

        // Store the bid info and show payment modal
        setLastBid({ bidId: response.bidId, amount });
        setShowPaymentModal(true);
      } else {
        setError(response.error || "Failed to place bid");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user || !auction.buy_now) return;
    router.push(
      `/checkout?auctionId=${auction.id}&type=buy_now&amount=${auction.buy_now}`
    );
  };

  const handlePaymentSuccess = () => {
    if (lastBid) {
      // Redirect to post-bid page after successful payment
      setTimeout(() => {
        router.push(
          `/post-bid/${lastBid.bidId}?current_price=${lastBid.amount}`
        );
      }, 1000);
    }
  };

  if (!user) {
    return (
      <div className="p-6 border rounded-lg bg-muted/30">
        <p className="text-center text-muted-foreground mb-4">
          Please log in to place bids or make purchases
        </p>
        <Button className="w-full" asChild>
          <a href="/login">Login to Bid</a>
        </Button>
      </div>
    );
  }

  if (auction.status !== "active") {
    return (
      <div className="p-6 border rounded-lg bg-muted/30">
        <p className="text-center text-muted-foreground">
          This auction has ended
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Elements stripe={stripePromise}>
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          bidId={lastBid?.bidId || ""}
          amount={lastBid?.amount || 0}
          onSuccess={handlePaymentSuccess}
        />
      </Elements>
      
      {/* Payment Security Disclaimer Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Secure Payment Authorization
            </DialogTitle>
            <DialogDescription>
              We need to securely store your payment method for this bid
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Your card will only be charged if you win the auction</span>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">Demo Credentials</h4>
                    <p className="text-xs text-amber-700">
                      Use card: <strong>4242 4242 4242 4242</strong><br />
                      Any future expiry date, any CVC<br />
                      Any ZIP code
                    </p>
                  </div>
                  
                  <Elements stripe={stripePromise}>
                    <PaymentModal
                      open={showPaymentModal}
                      onOpenChange={setShowPaymentModal}
                      bidId={lastBid?.bidId || ""}
                      amount={lastBid?.amount || 0}
                      onSuccess={handlePaymentSuccess}
                      compact={true}
                    />
                  </Elements>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {(error || success) && (
        <Alert variant={error ? "destructive" : "default"}>
          <AlertDescription>{error || success}</AlertDescription>
        </Alert>
      )}

      <div className="p-6 border rounded-lg space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Current Highest Bid
          </p>
          <p className="text-3xl font-bold">
            ${currentPrice.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handlePlaceBid} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Your Bid Amount</Label>
            <Input
              id="bidAmount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Minimum: $${minBid.toFixed(2)}`}
              min={minBid.toString()}
              step="0.01"
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum bid: ${minBid.toFixed(2)} (current bid + $25)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || redirecting}>
            {loading || redirecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {redirecting
                  ? "Redirecting..."
                  : "Placing Bid..."}
              </>
            ) : (
              <>
                <Gavel className="h-4 w-4 mr-2" />
                Place Bid
              </>
            )}
          </Button>
        </form>

        {auction.buy_now && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Skip the bidding
              </p>
              <p className="text-xl font-semibold">
                ${auction.buy_now}
              </p>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="w-full"
                disabled={loading}>
                <Zap className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Buy Now"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}