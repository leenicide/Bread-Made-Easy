import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, DollarSign, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-6xl mx-auto text-center">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Ready-Made Sales Funnels That Convert
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Skip months of development. Get proven, high-converting sales funnels through our exclusive auction
            marketplace. Bid on premium funnels or buy instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auctions">
                Browse Auctions <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/buy-now">Buy Now</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Auction Excitement</h3>
            <p className="text-muted-foreground text-center">
              Bid on exclusive funnels with real-time auctions. Get premium assets at competitive prices.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Instant Purchase</h3>
            <p className="text-muted-foreground text-center">
              Need it now? Buy proven funnels instantly with our Buy Now option. No waiting required.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Custom Solutions</h3>
            <p className="text-muted-foreground text-center">
              Need something specific? Request custom funnels tailored to your exact business needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
