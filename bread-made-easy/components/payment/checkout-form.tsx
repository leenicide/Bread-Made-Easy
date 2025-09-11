"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { paymentService } from "@/lib/payment-service"
import { useAuth } from "@/contexts/auth-context"
import { CreditCard, Lock, Shield } from "lucide-react"

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  amount: number
  title: string
  description?: string
  metadata?: Record<string, string>
  onSuccess?: (purchaseId: string) => void
  onError?: (error: string) => void
}

function CheckoutFormInner({ amount, title, description, metadata = {}, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Create PaymentIntent as soon as the page loads
    paymentService.createPaymentIntent(amount, "usd", { ...metadata, buyerId: user.id })
      .then((result) => {
        if (result.success && result.paymentIntent) {
          setClientSecret(result.paymentIntent.clientSecret)
          setPaymentIntentId(result.paymentIntent.id)
        } else {
          setError(result.error || "Failed to initialize payment")
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to initialize payment")
      })
  }, [user, amount, metadata])
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!stripe || !elements || !user) return

  setError("")
  setLoading(true)

  try {
    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/purchase-success?payment_intent=${paymentIntentId}&auctionId=${metadata.auctionId}&type=${metadata.type}&buyerId=${user.id}`,
      },
      redirect: 'if_required'
    })

    if (submitError) {
      setError(submitError.message || "An error occurred during payment")
      throw new Error(submitError.message)
    }

    // Check if payment was completed successfully
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment completed successfully, confirm with our backend
      const confirmResponse = await paymentService.confirmPayment(
        paymentIntent.id,
        "",
        { ...metadata, buyerId: user.id }
      )

      if (confirmResponse.success && confirmResponse.purchase) {
        onSuccess?.(confirmResponse.purchase.id)
      } else {
        throw new Error(confirmResponse.error || "Payment confirmation failed")
      }
    } else if (paymentIntent && paymentIntent.status === 'processing') {
      // Payment is processing, show message to user
      setMessage("Your payment is processing. We'll notify you when it's complete.")
      
      // Poll for payment completion
      const checkPaymentStatus = async () => {
        try {
          const statusResponse = await paymentService.verifyPaymentStatus(paymentIntent.id)
          
          if (statusResponse.success && statusResponse.paymentIntent?.status === 'succeeded') {
            // Payment succeeded, confirm with backend
            const confirmResponse = await paymentService.confirmPayment(
              paymentIntent.id,
              "",
              { ...metadata, buyerId: user.id }
            )
            
            if (confirmResponse.success && confirmResponse.purchase) {
              onSuccess?.(confirmResponse.purchase.id)
            } else {
              setError(confirmResponse.error || "Payment confirmation failed after processing")
            }
          } else if (statusResponse.success && statusResponse.paymentIntent?.status === 'processing') {
            // Still processing, check again in 2 seconds
            setTimeout(checkPaymentStatus, 2000)
          } else {
            setError(statusResponse.error || "Payment failed after processing")
          }
        } catch (err) {
          setError("Error checking payment status")
        }
      }
      
      // Start polling
      setTimeout(checkPaymentStatus, 2000)
    } else {
      // If we get here, the payment might not have been completed yet
      // This can happen with some payment methods that require additional steps
      setMessage("Please complete the payment process. If you were redirected away, check your email for confirmation.")
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
    setError(errorMessage)
    onError?.(errorMessage)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    if (!stripe || !clientSecret) return

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent) {
        switch (paymentIntent.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      }
    });
  }, [stripe, clientSecret]);

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please log in to complete your purchase</p>
            <Button asChild>
              <a href="/login">Login to Continue</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>Complete your purchase securely with Stripe</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{title}</span>
                <span className="text-sm font-medium">${amount}</span>
              </div>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Element */}
          {clientSecret && (
            <div className="space-y-4">
              <PaymentElement 
                options={{
                  layout: "tabs",
                  defaultValues: {
                    billingDetails: {
                      name: user.display_name || "",
                      email: user.email || "",
                    }
                  }
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={!stripe || !elements || loading || !clientSecret}
          >
            <Lock className="h-4 w-4 mr-2" />
            {loading ? "Processing Payment..." : `Pay $${amount}`}
          </Button>

          {/* Demo information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Demo Mode: Use test card 4242 4242 4242 4242 with any future date and CVC
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export function CheckoutForm(props: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState("")

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    paymentService.createPaymentIntent(props.amount, "usd", props.metadata || {})
      .then((result) => {
        if (result.success && result.paymentIntent) {
          setClientSecret(result.paymentIntent.clientSecret)
        }
      })
      .catch((err) => {
        console.error("Failed to create payment intent:", err)
      })
  }, [props.amount, props.metadata])

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
  }

  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutFormInner {...props} />
        </Elements>
      )}
    </>
  )
}