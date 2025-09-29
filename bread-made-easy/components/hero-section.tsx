import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Clock,
    Shield,
    Zap,
    Crown,
    Target,
    Timer,
    Gem,
    DollarSign,
    Users,
    CheckCircle,
    Star,
    Award,
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="py-20 px-4">
            <div className="container max-w-6xl mx-auto text-center">
                {/* Headline */}
                <div className="max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        ⚡ Wealth Oven Auctions
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        Own a One-of-a-Kind Business System — Available Only Once
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="text-lg px-8" asChild>
                            <Link href="/auctions">
                                View Live Auctions{" "}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        
                    </div>
                </div>

                {/* What's a Wealth Oven Auction */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="flex items-center justify-center mb-8">
                        <Gem className="h-8 w-8 text-primary mr-3" />
                        <h2 className="text-3xl font-bold">
                            What Is a Wealth Oven Auction?
                        </h2>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                        Every Wealth Oven auction is a chance to own a completely unique business system. These aren't templates or leases. Each Oven is a custom-built, one-off system designed for conversion.
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        {[
                            {
                                icon: Crown,
                                title: "Full Ownership",
                                desc: "You own the system outright"
                            },
                            {
                                icon: Zap,
                                title: "Lifetime Use",
                                desc: "No royalties, no recurring fees"
                            },
                            {
                                icon: Shield,
                                title: "Exclusive Rights",
                                desc: "It's yours alone - never resold"
                            }
                        ].map((item, index) => (
                            <div key={index} className="p-6 rounded-lg border bg-card">
                                <item.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* What's Included */}
                <div className="max-w-4xl mx-auto mb-16 bg-muted/30 py-12 px-8 rounded-lg">
                    <h2 className="text-3xl font-bold mb-8">What's Included in an Auction Build</h2>
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                        {[
                            "Complete Funnel System (opt-in, sales page, checkout, upsells/downsells, thank you page)",
                            "Conversion Copy written for you",
                            "Automations (emails, SMS, tagging, sequences)",
                            "Checkout Integration (Stripe, PayPal, or custom)",
                            "Upsells & Order Bumps to maximize average order value",
                            "Tracking & Analytics Setup (pixels, Google Tag Manager)",
                            "Exclusive Branding & Design (no two auctions are the same)"
                        ].map((item, index) => (
                            <div key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-muted-foreground">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How Auctions Work */}
                <div className="max-w-4xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-8">How Auctions Work</h2>
                    <div className="grid md:grid-cols-5 gap-4">
                        {[
                            {
                                step: "1",
                                title: "Browse Live Auctions",
                                desc: "Up to 4 running at any time"
                            },
                            {
                                step: "2",
                                title: "See Details",
                                desc: "Complete listing with countdown"
                            },
                            {
                                step: "3",
                                title: "Place a Bid",
                                desc: "Secure your spot to own the Oven"
                            },
                            {
                                step: "4",
                                title: "Make an Offer",
                                desc: "Submit private offer to end early"
                            },
                            {
                                step: "5",
                                title: "Win & Launch",
                                desc: "Oven is yours — exclusive, forever"
                            }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center p-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                    <span className="font-bold text-primary text-sm">{item.step}</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1 text-center">{item.title}</h3>
                                <p className="text-muted-foreground text-xs text-center">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Auctions */}
                <div className="max-w-4xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-8">Why Choose Auctions Over Leasing?</h2>
                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div className="space-y-6">
                            {[
                                "Scarcity & Exclusivity → Only one winner. Nobody else in the world will ever get that same system.",
                                "Full Ownership → Unlike leases, you don't share revenue. No buyouts. No limits.",
                                "Long-Term Asset → Your Wealth Oven is yours for life. It can scale endlessly without extra payments to us.",
                                "Prestige → Owning a one-of-a-kind system sets you apart from anyone else in your industry."
                            ].map((item, index) => (
                                <div key={index} className="flex items-start">
                                    <Award className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-card p-6 rounded-lg border">
                            <h3 className="font-semibold text-lg mb-4 text-center">Who Should Bid?</h3>
                            <div className="space-y-4">
                                {[
                                    "Entrepreneurs who want to stand out with something exclusive",
                                    "Coaches, consultants, or agencies ready to scale with their own system",
                                    "Businesses tired of renting or revenue sharing, who want full control forever",
                                    "Investors who want to own digital assets that generate long-term returns"
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start">
                                        <Users className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-muted-foreground">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auction Buyer Protections */}
                <div className="max-w-4xl mx-auto mb-16 bg-primary/5 py-12 px-8 rounded-lg">
                    <div className="flex items-center justify-center mb-8">
                        <Shield className="h-8 w-8 text-primary mr-3" />
                        <h2 className="text-3xl font-bold">Auction Buyer Protections</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Secure Payment",
                                desc: "Your card is only charged if you win"
                            },
                            {
                                icon: Clock,
                                title: "Transparency",
                                desc: "Current price and bids are displayed live"
                            },
                            {
                                icon: Star,
                                title: "Fair Process",
                                desc: "Timers, notifications, and bid confirmations keep it clear"
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center p-6">
                                <item.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Ready to Own Your Exclusive Wealth Oven?</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Don't waste years building from scratch. Don't settle for cookie-cutter funnels.
                        Bid in a Wealth Oven Auction today and own your system outright — one-of-a-kind, built-for-profit, and yours forever.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="text-lg px-8" asChild>
                            <Link href="/auctions">
                                View Live Auctions{" "}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                            <Link href="/auctions">
                                Place Your Bid Now{" "}
                                <DollarSign className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}