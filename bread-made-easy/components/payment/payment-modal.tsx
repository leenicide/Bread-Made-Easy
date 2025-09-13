"use client";

import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
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
import { paymentService } from "@/lib/paymentService";
import { useAuth } from "@/contexts/auth-context";
import { CreditCard, Lock, Shield, CheckCircle, Info, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionId: string;
  amount: number;
  onSuccess: (setupIntentId: string, paymentMethodId: string) => void;
  onError: (error: string) => void;
  compact?: boolean;
}

// Inner component that uses Stripe hooks
function PaymentFormInner({
  clientSecret,
  auctionId,
  amount,
  onSuccess,
  onOpenChange,
  onError,
}: {
  clientSecret: string;
  auctionId: string;
  amount: number;
  onSuccess: (setupIntentId: string, paymentMethodId: string) => void;
  onOpenChange: (open: boolean) => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    setMessage("");
    setLoading(true);

    try {
      // Use confirmSetup for card setup instead of payment
      const { error: submitError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/post-bid?auctionId=${auctionId}`,
        },
        redirect: "if_required",
      });

      if (submitError) {
        onError(submitError.message || "An error occurred during payment setup");
        throw new Error(submitError.message);
      }

      if (setupIntent && setupIntent.status === "succeeded") {
        // Payment method setup completed successfully
        setMessage("Payment method authorized successfully!");
        onSuccess(setupIntent.id, setupIntent.payment_method as string);
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      } else {
        setMessage("Please complete the payment method setup.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <Alert className="py-2">
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </Alert>
      )}

      {/* Order Summary */}
      <div className="p-3 bg-muted/20 rounded-lg text-sm">
        <h3 className="font-semibold mb-1">Bid Security Authorization</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Bid Amount</span>
            <span className="font-medium">${amount}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between font-semibold">
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
        <div className="space-y-2">
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
        disabled={!stripe || !elements || loading}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        {loading ? "Setting up..." : `Authorize Payment Method`}
      </Button>
    </form>
  );
}

export function PaymentModal({
  open,
  onOpenChange,
  auctionId,
  amount,
  onSuccess,
  onError,
  compact = false,
}: PaymentModalProps) {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !open || amount <= 0) return;

    setLoading(true);
    // Create SetupIntent when modal opens instead of PaymentIntent
    paymentService
      .createSetupIntent({
        auctionId,
        buyerId: user.id,
      })
      .then((result) => {
        if (result.success && result.setupIntent) {
          setClientSecret(result.setupIntent.clientSecret);
        } else {
          onError(result.error || "Failed to initialize payment setup");
        }
      })
      .catch((err) => {
        onError(err.message || "Failed to initialize payment setup");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, amount, auctionId, open, onError]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#6366f1',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Secure Payment Setup
          </DialogTitle>
          <DialogDescription className="text-sm">
            We need to securely store your payment method for this bid
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Security Assurance */}
          <Alert className="py-2">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your card will only be charged if you win the auction. This is a secure authorization to ensure serious bids only.
            </AlertDescription>
          </Alert>

          {/* Demo Information */}
          {process.env.NODE_ENV === "development" && (
            <Card className="bg-amber-50 border-amber-200 p-3">
              <h4 className="font-medium text-amber-800 mb-1 flex items-center gap-2 text-sm">
                <Info className="h-3 w-3" />
                Demo Credentials
              </h4>
              <p className="text-xs text-amber-700">
                Use card: <strong>4242 4242 4242 4242</strong>
                <br />
                Any future expiry date, any CVC, any ZIP code
              </p>
            </Card>
          )}

          {/* Payment Form */}
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={options}>
                  <PaymentFormInner
                    clientSecret={clientSecret}
                    auctionId={auctionId}
                    amount={amount}
                    onSuccess={onSuccess}
                    onOpenChange={onOpenChange}
                    onError={onError}
                  />
                </Elements>
              ) : null}
            </CardContent>
          </Card>

          {/* Additional Security Info */}
          <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-1">
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