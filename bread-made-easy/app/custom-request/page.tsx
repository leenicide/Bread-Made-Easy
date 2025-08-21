import { Header } from "@/components/header"
import { EnhancedRequestForm } from "@/components/custom-request/enhanced-request-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Clock, Users, CheckCircle, Star, MessageSquare, Crown, Target, Scale, Gem, Calendar } from "lucide-react"

export default function CustomRequestPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Your Business. Your Oven. Built From Scratch.</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Not all Wealth Ovens are created equal. Some are engineered exclusively for one business — yours.
            </p>
          </div>

          {/* Why Choose a Custom Build */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <Gem className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-bold">Why Choose a Custom Build?</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6 text-center max-w-4xl mx-auto">
              If the Wealth Ovens released at auction are powerful machines, then a Custom Wealth Oven™ is a precision-crafted masterpiece.
            </p>
            <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto">
              A custom build means every page, headline, and sequence is designed around your exact product, market, and goals. 
              You'll get private strategy calls with our team to map your unique Oven blueprint, creating a system that doesn't 
              just generate sales — it maximizes your specific business ROI.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Precision Crafted</h3>
              <p className="text-muted-foreground">Tailored to your exact product, market, and conversion goals</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Private Strategy</h3>
              <p className="text-muted-foreground">Direct consultation with our expert team for your blueprint</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Built for Scale</h3>
              <p className="text-muted-foreground">Designed to grow with you, not limit your potential</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Exclusive Access</h3>
              <p className="text-muted-foreground">Only a handful of custom builds accepted each quarter</p>
            </div>
          </div>

          {/* The Process */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">The Process</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { step: "1", title: "Application", desc: "Submit your details to show you're a serious applicant" },
                { step: "2", title: "Strategy Call", desc: "We dig into your business, goals, and market" },
                { step: "3", title: "Blueprint", desc: "We design a system tailored exclusively for you" },
                { step: "4", title: "Build & Launch", desc: "Our team creates, deploys, and supports your Oven" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusivity + Scarcity */}
          <div className="mb-16 text-center">
            <div className="flex items-center justify-center mb-8">
              <Calendar className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-bold">Exclusivity + Scarcity</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              We only take on a handful of custom builds per quarter because each one requires deep focus, attention to detail, 
              and personalized strategy. If you want a spot, you need to apply now. Once the quarter fills, applications close.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <EnhancedRequestForm />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Complete custom Wealth Oven design and development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Private strategy sessions with our team</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Mobile-responsive design</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Source code and documentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Unlimited revisions during design phase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">90-day support after delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Performance optimization and analytics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Client Testimonials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        "The custom Wealth Oven transformed our business. We're seeing 5x ROI within the first quarter."
                      </p>
                      <p className="text-xs font-medium mt-1">- Michael T., E-commerce Owner</p>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        "Worth every penny. The strategic approach and custom build delivered exactly what we needed."
                      </p>
                      <p className="text-xs font-medium mt-1">- Jessica L., SaaS Founder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Limited Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We only accept a handful of custom builds each quarter. If accepted, you'll join an exclusive circle 
                    of Wealth Oven owners with systems that can't be duplicated.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}