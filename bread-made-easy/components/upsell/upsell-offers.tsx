"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Clock, Users } from "lucide-react"
import Link from "next/link"

interface UpsellOffer {
  id: string
  title: string
  description: string
  originalPrice: number
  upsellPrice: number
  savings: number
  features: string[]
  urgency?: string
  social_proof?: string
  category: string
}

const upsellOffers: UpsellOffer[] = [
  {
    id: "setup-service",
    title: "Professional Setup Service",
    description:
      "Let our experts set up your funnel for you. Complete installation, configuration, and optimization included.",
    originalPrice: 497,
    upsellPrice: 297,
    savings: 200,
    features: [
      "Complete funnel installation",
      "Custom domain setup",
      "Email integration configuration",
      "Analytics tracking setup",
      "Mobile optimization",
      "1-hour training session",
    ],
    urgency: "Limited time: 40% off setup service",
    social_proof: "127 customers chose this upgrade",
    category: "Service",
  },
  {
    id: "premium-templates",
    title: "Premium Template Bundle",
    description: "Get 10 additional high-converting templates in the same niche. Expand your funnel arsenal instantly.",
    originalPrice: 299,
    upsellPrice: 149,
    savings: 150,
    features: [
      "10 premium funnel templates",
      "Multiple industry variations",
      "Advanced conversion elements",
      "A/B testing variations",
      "Bonus email sequences",
      "Lifetime updates",
    ],
    urgency: "50% off - Today only",
    social_proof: "4.9/5 rating from 89 customers",
    category: "Templates",
  },
  {
    id: "marketing-course",
    title: "Funnel Marketing Mastery Course",
    description: "Learn how to drive traffic and optimize conversions with our comprehensive video course.",
    originalPrice: 197,
    upsellPrice: 97,
    savings: 100,
    features: [
      "4+ hours of video content",
      "Traffic generation strategies",
      "Conversion optimization tips",
      "Email marketing automation",
      "Facebook ads training",
      "Private community access",
    ],
    urgency: "Special launch price",
    social_proof: "Join 500+ successful students",
    category: "Education",
  },
]

interface UpsellOffersProps {
  purchaseType?: string
  purchaseAmount?: number
}

export function UpsellOffers({ purchaseType, purchaseAmount }: UpsellOffersProps) {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([])

  const toggleOffer = (offerId: string) => {
    setSelectedOffers((prev) => (prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]))
  }

  const totalUpsellValue = selectedOffers.reduce((total, offerId) => {
    const offer = upsellOffers.find((o) => o.id === offerId)
    return total + (offer?.upsellPrice || 0)
  }, 0)

  const totalSavings = selectedOffers.reduce((total, offerId) => {
    const offer = upsellOffers.find((o) => o.id === offerId)
    return total + (offer?.savings || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Wait! Don't Miss These Exclusive Offers</h2>
        <p className="text-muted-foreground">
          Maximize your funnel's potential with these hand-picked upgrades - available only to customers like you.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {upsellOffers.map((offer) => (
          <Card
            key={offer.id}
            className={`relative overflow-hidden transition-all ${
              selectedOffers.includes(offer.id) ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-lg"
            }`}
          >
            {offer.urgency && (
              <div className="absolute top-0 left-0 right-0 bg-destructive text-destructive-foreground text-center py-1 text-sm font-medium">
                <Clock className="inline h-3 w-3 mr-1" />
                {offer.urgency}
              </div>
            )}

            <CardHeader className={offer.urgency ? "pt-8" : ""}>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{offer.category}</Badge>
                {offer.social_proof && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{offer.social_proof}</span>
                  </div>
                )}
              </div>

              <CardTitle className="text-lg">{offer.title}</CardTitle>
              <CardDescription>{offer.description}</CardDescription>

              <div className="flex items-center gap-2 pt-2">
                <span className="text-2xl font-bold text-primary">${offer.upsellPrice}</span>
                <span className="text-lg text-muted-foreground line-through">${offer.originalPrice}</span>
                <Badge variant="destructive" className="text-xs">
                  Save ${offer.savings}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {offer.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={selectedOffers.includes(offer.id) ? "secondary" : "default"}
                onClick={() => toggleOffer(offer.id)}
              >
                {selectedOffers.includes(offer.id) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Add This Upgrade
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOffers.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Your Upgrade Bundle</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedOffers.length} item{selectedOffers.length > 1 ? "s" : ""} selected
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${totalUpsellValue}</p>
                <p className="text-sm text-green-600">Save ${totalSavings} total</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" size="lg" asChild>
                <Link href={`/checkout?type=upsell&amount=${totalUpsellValue}&offers=${selectedOffers.join(",")}`}>
                  <Zap className="h-4 w-4 mr-2" />
                  Add Selected Upgrades - ${totalUpsellValue}
                </Link>
              </Button>
              <Button variant="outline" className="bg-transparent" onClick={() => setSelectedOffers([])}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">No thanks, continue to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
