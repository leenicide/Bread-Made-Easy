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
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="py-20 px-4">
            <div className="container max-w-6xl mx-auto text-center">
                {/* Headline */}
                <div className="max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Only 1 Wealth Oven™ Per Auction. One Winner. One System.
                        Forever.
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        Launch instantly. Skip the learning curve. Own a
                        one-of-a-kind wealth machine engineered to print money.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="text-lg px-8" asChild>
                            <Link href="/auctions">
                                Place Your Bid Now{" "}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
                {/* What's a Wealth Oven */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="flex items-center justify-center mb-8">
                        <Gem className="h-8 w-8 text-primary mr-3" />
                        <h2 className="text-3xl font-bold">
                            What's a Wealth Oven™?
                        </h2>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                        A Wealth Oven™ isn't a template, a theory, or just
                        another funnel. It's a complete, done-for-you business
                        system — designed to turn strangers into paying
                        customers like clockwork.
                    </p>
                    <p className="text-lg text-muted-foreground">
                        Most businesses are like kitchens with no oven. They've
                        got the ingredients but no system to transform them into
                        something valuable. That's where a Wealth Oven comes in.
                        It takes raw attention, applies heat (psychology, flow,
                        trust), and bakes profits — consistently, automatically,
                        on repeat.
                    </p>
                </div>

                {/* How It Works */}
                <div className="max-w-4xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-8">How It Works</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Crown,
                                title: "Bid",
                                desc: "Place your bid to secure a chance at ownership",
                            },
                            {
                                icon: Zap,
                                title: "Win",
                                desc: "Highest bidder takes it when the clock runs out",
                            },
                            {
                                icon: Target,
                                title: "Deploy",
                                desc: "We hand over your Wealth Oven and guide setup",
                            },
                            {
                                icon: DollarSign,
                                title: "Profit",
                                desc: "You drive traffic, your Oven does the rest",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center p-6 rounded-lg border bg-card">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <item.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground text-center text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Auction Matters */}
                <div className="max-w-4xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-8">
                        Why This Auction Matters
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                        I only release one Wealth Oven per auction. That means
                        one winner only. Once it's gone, it's gone forever.
                    </p>
                    <p className="text-lg text-muted-foreground">
                        This isn't about mass templates. It's about exclusivity.
                        A Wealth Oven is a scarce, high-performance asset — and
                        the auction ensures only those serious enough will own
                        one.
                    </p>
                </div>

                {/* Trust & Credibility */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center mb-8">
                        <Shield className="h-8 w-8 text-primary mr-3" />
                        <h2 className="text-3xl font-bold">
                            Trust & Credibility
                        </h2>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                        All bids and payments are secured via Stripe — the
                        world's most trusted payment processor. Auctions are
                        transparent and fair with no hidden rules.
                    </p>
                    <p className="text-lg text-muted-foreground">
                        You're not bidding on a dream. You're bidding on a
                        proven system with structure, psychology, and automation
                        already baked in.
                    </p>
                </div>
            </div>
        </section>
    );
}
