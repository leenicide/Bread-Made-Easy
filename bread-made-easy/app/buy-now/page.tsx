import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap } from "lucide-react"
import Link from "next/link"

// Mock direct sale funnels
const mockFunnels = [
  {
    id: "1",
    title: "Fitness Coaching Funnel",
    description:
      "Complete fitness coaching funnel with consultation booking, payment processing, and client onboarding automation.",
    price: 899,
    originalPrice: 1299,
    rating: 4.9,
    reviews: 47,
    category: "Health & Fitness",
    imageUrl: "/fitness-coaching-funnel.png",
    features: [
      "Landing page with video testimonials",
      "Consultation booking system",
      "Payment processing integration",
      "Automated email sequences",
      "Client onboarding workflow",
      "Progress tracking dashboard",
    ],
    isPopular: true,
  },
  {
    id: "2",
    title: "Real Estate Lead Magnet",
    description:
      "High-converting real estate funnel with property valuation tool, lead capture, and automated follow-up system.",
    price: 649,
    originalPrice: 899,
    rating: 4.7,
    reviews: 32,
    category: "Real Estate",
    imageUrl: "/real-estate-funnel.png",
    features: [
      "Property valuation calculator",
      "Lead capture forms",
      "CRM integration ready",
      "Automated drip campaigns",
      "Market report generator",
      "Mobile-responsive design",
    ],
    isPopular: false,
  },
  {
    id: "3",
    title: "Digital Product Launch Kit",
    description:
      "Complete product launch funnel with early bird pricing, affiliate program setup, and post-launch upsells.",
    price: 1199,
    originalPrice: 1599,
    rating: 5.0,
    reviews: 23,
    category: "Digital Products",
    imageUrl: "/digital-product-launch-funnel.png",
    features: [
      "Pre-launch landing page",
      "Early bird pricing system",
      "Affiliate tracking setup",
      "Upsell sequence automation",
      "Social proof integration",
      "Analytics dashboard",
    ],
    isPopular: true,
  },
]

export default function BuyNowPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ready-Made Funnels</h1>
          <p className="text-muted-foreground">
            Get instant access to proven, high-converting sales funnels. No bidding required - purchase and download
            immediately.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {mockFunnels.map((funnel) => (
            <Card key={funnel.id} className="overflow-hidden relative">
              {funnel.isPopular && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-orange-500 hover:bg-orange-600">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}

              <div className="aspect-video bg-muted">
                <img
                  src={funnel.imageUrl || "/placeholder.svg"}
                  alt={funnel.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{funnel.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{funnel.rating}</span>
                    <span className="text-sm text-muted-foreground">({funnel.reviews})</span>
                  </div>
                </div>

                <CardTitle className="text-lg">{funnel.title}</CardTitle>
                <CardDescription className="line-clamp-2">{funnel.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${funnel.price}</span>
                    <span className="text-lg text-muted-foreground line-through">${funnel.originalPrice}</span>
                    <Badge variant="destructive" className="text-xs">
                      Save ${funnel.originalPrice - funnel.price}
                    </Badge>
                  </div>

                  <ul className="space-y-2">
                    {funnel.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {funnel.features.length > 4 && (
                      <li className="text-sm text-muted-foreground">+{funnel.features.length - 4} more features</li>
                    )}
                  </ul>

                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/checkout?auctionId=${funnel.id}&type=direct_sale&amount=${funnel.price}`}>
                      <Zap className="h-4 w-4 mr-2" />
                      Buy Now - Instant Access
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
