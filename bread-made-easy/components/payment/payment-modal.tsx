"use client";

import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { paymentService } from "@/lib/payment-service";
import { useAuth } from "@/contexts/auth-context";
import { CreditCard, Lock, Shield, CheckCircle, Info } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bidId: string;
  amount: number;
  onSuccess: () => void;
  compact?: boolean;
}

export function PaymentModal({
  open,
  onOpenChange,
  bidId,
  amount,
  onSuccess,
  compact = false,
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || !open) return;

    // Create PaymentIntent when modal opens
    paymentService
      .createPaymentIntent(amount, "usd", {
        bidId,
        type: "bid_security",
        buyerId: user.id,
      })
      .then((result) => {
        if (result.success && result.paymentIntent) {
          setClientSecret(result.paymentIntent.clientSecret);
          setPaymentIntentId(result.paymentIntent.id);
        } else {
          setError(result.error || "Failed to initialize payment");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to initialize payment");
      });
  }, [user, amount, bidId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    setError("");
    setLoading(true);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/post-bid/${bidId}?payment_intent=${paymentIntentId}&bidId=${bidId}&buyerId=${user.id}`,
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message || "An error occurred during payment");
        throw new Error(submitError.message);
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment completed successfully, confirm with our backend
        const confirmResponse = await paymentService.confirmPayment(
          paymentIntent.id,
          "",
          {
            bidId,
            type: "bid_security",
            buyerId: user.id,
          }
        );

        if (confirmResponse.success && confirmResponse.purchase) {
          setMessage("Payment method saved successfully!");
          setTimeout(() => {
            onSuccess();
            onOpenChange(false);
          }, 1500);
        } else {
          throw new Error(confirmResponse.error || "Payment confirmation failed");
        }
      } else if (paymentIntent && paymentIntent.status === "processing") {
        setMessage("Your payment is processing. We'll notify you when it's complete.");
      } else {
        setMessage("Please complete the payment process.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md lg:max-w-lg">
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
          {/* Security Assurance */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your card will only be charged if you win the auction. This is a secure authorization to ensure serious bids only.
            </AlertDescription>
          </Alert>

          {/* Demo Information */}
          {process.env.NODE_ENV === "development" && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Demo Credentials
                </h4>
                <p className="text-xs text-amber-700">
                  Use card: <strong>4242 4242 4242 4242</strong>
                  <br />
                  Any future expiry date, any CVC
                  <br />
                  Any ZIP code
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {/* Order Summary */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2 text-sm">Bid Security Authorization</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Bid Amount</span>
                      <span className="font-medium">${amount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Authorization Hold</span>
                      <span>$0.00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      No charge will be made unless you win the auction
                    </p>
                  </div>
                </div>

                {/* Payment Element */}
                {clientSecret && (
                  <div className="space-y-3">
                    <PaymentElement
                      options={{
                        layout: "tabs",
                        defaultValues: {
                          billingDetails: {
                            name: user?.display_name || "",
                            email: user?.email || "",
                          },
                        },
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!stripe || !elements || loading || !clientSecret}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? "Processing..." : `Authorize Payment Method`}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Security Info */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Stripe Secure</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}