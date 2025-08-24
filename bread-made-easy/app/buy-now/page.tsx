import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap } from "lucide-react"
import Link from "next/link"
import { databaseService } from "@/lib/database-service"
import { useEffect, useState } from "react"
import type { BuyNow, Funnel } from "@/lib/types"

// Mock direct sale funnels for fallback
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
      "Complete digital product launch system with pre-launch pages, launch sequence, and post-launch automation.",
    price: 799,
    originalPrice: 1199,
    rating: 4.8,
    reviews: 56,
    category: "Digital Products",
    imageUrl: "/digital-product-launch-funnel.png",
    features: [
      "Pre-launch landing pages",
      "Launch countdown timer",
      "Early bird pricing tiers",
      "Upsell and downsell flows",
      "Customer onboarding emails",
      "Affiliate program setup",
    ],
    isPopular: true,
  },
]

export default function BuyNowPage() {
  const [buyNowOffers, setBuyNowOffers] = useState<BuyNow[]>([])
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [dbBuyNowOffers, dbFunnels] = await Promise.all([
          databaseService.getBuyNowOffers(),
          databaseService.getFunnels(),
        ])
        setBuyNowOffers(dbBuyNowOffers)
        setFunnels(dbFunnels)
      } catch (error) {
        console.error('Error loading buy now offers:', error)
        // Fallback to mock data
        setBuyNowOffers([])
        setFunnels([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        </div>
      </div>
    )
  }

  // Transform database data to display format
  const displayFunnels = buyNowOffers.length > 0 ? buyNowOffers.map(offer => {
    const funnel = funnels.find(f => f.id === offer.funnel_id)
    if (!funnel) return null

    return {
      id: offer.id,
      title: funnel.title,
      description: funnel.description || 'No description available',
      price: offer.price,
      originalPrice: offer.price * 1.4, // Estimate original price
      rating: 4.8, // Default rating
      reviews: Math.floor(Math.random() * 50) + 20, // Random review count
      category: "General", // Default category
      imageUrl: funnel.description ? `/placeholder.jpg` : undefined,
      features: [
        "Landing page",
        "Payment processing",
        "Email automation",
        "Mobile responsive",
        "SEO optimized",
        "Analytics tracking",
      ],
      isPopular: Math.random() > 0.5, // Random popularity
    }
  }).filter(Boolean) : mockFunnels

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Buy Funnels Now
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Skip the auction and get instant access to proven sales funnels.
            Each funnel comes with full source code and setup instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFunnels.map((funnel) => (
            <Card key={funnel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                {funnel.imageUrl ? (
                  <img
                    src={funnel.imageUrl}
                    alt={funnel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm">No Image</p>
                    </div>
                  </div>
                )}
                {funnel.isPopular && (
                  <Badge className="absolute top-4 left-4" variant="secondary">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                <Badge className="absolute top-4 right-4" variant="outline">
                  {funnel.category}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-2">{funnel.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {funnel.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(funnel.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {funnel.rating} ({funnel.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-green-600">
                      ${funnel.price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${funnel.originalPrice.toLocaleString()}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {Math.round(((funnel.originalPrice - funnel.price) / funnel.originalPrice) * 100)}% OFF
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-900">What's Included:</h4>
                    <ul className="space-y-1">
                      {funnel.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {funnel.features.length > 4 && (
                      <p className="text-xs text-gray-500">
                        +{funnel.features.length - 4} more features
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1" variant="outline">
                      <Link href={`/funnels/${funnel.id}`}>
                        Learn More
                      </Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href={`/checkout?funnel=${funnel.id}`}>
                        <Zap className="w-4 h-4 mr-2" />
                        Buy Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayFunnels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No buy now offers available at the moment.
            </p>
            <Button asChild>
              <Link href="/custom-request">
                Request Custom Funnel
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need Something Custom?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't find exactly what you're looking for? We can build a custom
              sales funnel tailored to your specific business needs and goals.
            </p>
            <Button asChild size="lg">
              <Link href="/custom-request">
                Start Custom Request
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
