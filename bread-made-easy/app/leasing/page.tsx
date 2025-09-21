"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle,
    Zap,
    DollarSign,
    Shield,
    TrendingUp,
    Calendar,
    Target,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { LeasingModal } from "@/components/lease/leasing-modal";

export default function LeaseHomePage() {
    const [leasingModalOpen, setLeasingModalOpen] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Your Supabase video URL
    const videoUrl = "https://oedkzwoxhvitsbarbnck.supabase.co/storage/v1/object/public/funnels/riverside_earlwhite__%20sep%2018,%202025%20001_earlwhite_wolverine.mp4";

    const thumbnailUrl = "/thumbnail.png"; // Assuming it's in your public folder

    const handlePlayVideo = () => {
        setVideoPlaying(true);
        setVideoError(false);
        
        // Give React a moment to update the DOM before trying to play
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play().catch(error => {
                    console.error("Video play failed:", error);
                    setVideoError(true);
                    setVideoPlaying(false);
                });
            }
        }, 100);
    };

    const handleVideoError = () => {
        setVideoError(true);
        setVideoPlaying(false);
    };


    return (
        <div className="min-h-screen">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
                    <div className="container max-w-6xl mx-auto text-center">
                        {/* Headline */}
                        <div className="max-w-3xl mx-auto mb-2">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Start a Done-for-You Business System Without No
                                Upfront Cost
                            </h1>
                            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
                                Lease a Wealth Oven today: a complete,
                                ready-to-run business system. No upfront fee. No
                                risk. We only profit when you do.
                            </p>

                            {/* VSL Player */}
                            <div className="my-10 mx-auto max-w-3xl">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl relative">
                                    {!videoPlaying || videoError ? (
                                        <>
                                            {/* Video thumbnail with play button */}
                                            <div
                                                className="absolute inset-0 bg-cover bg-center cursor-pointer flex items-center justify-center"
                                                style={{
                                                    backgroundImage: `url('${thumbnailUrl}')`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                                onClick={handlePlayVideo}>
                                                <div className="w-20 h-20 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center transition-all">
                                                    <svg
                                                        className="w-10 h-10 text-white ml-1"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M8 5V19L19 12L8 5Z"
                                                            fill="currentColor"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/30"></div>
                                        </>
                                    ) : (
                                        /* Embedded video player with Supabase URL */
                                        <video
                                            ref={videoRef}
                                            className="w-full h-full"
                                            controls
                                            autoPlay
                                            onError={handleVideoError}>
                                            <source
                                                src={videoUrl}
                                                type="video/mp4"
                                            />
                                            Your browser does not support the
                                            video tag.
                                        </video>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Watch this video to see how Wealth Oven leasing works
                                </p>
                                {videoError && (
                                    <p className="text-sm text-destructive mt-2">
                                        Video failed to load.{" "}
                                        <button 
                                            className="underline"
                                            onClick={handlePlayVideo}
                                        >
                                            Try again
                                        </button>
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="text-lg px-8"
                                    onClick={() => setLeasingModalOpen(true)}>
                                    Lease Your Wealth Oven Now{" "}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Section */}
                <section className="py-6 px-4 bg-muted/30">
                    <div className="container max-w-6xl mx-auto">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-8">
                                Most Businesses Burn Out Before They Even Start
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6 mt-12">
                                {[
                                    {
                                        title: "Wasted Resources",
                                        desc: "Months building websites, funnels, and ads that flop",
                                    },
                                    {
                                        title: "Costly Experiments",
                                        desc: "Thousands sunk into 'experiments' that never pay back",
                                    },
                                    {
                                        title: "No System",
                                        desc: "No way to consistently turn traffic into customers",
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-6 rounded-lg border bg-background">
                                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
                                            <Target className="h-6 w-6 text-destructive" />
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
                    </div>
                </section>

                {/* Solution Section */}
                <section className="py-16 px-4">
                    <div className="container max-w-6xl mx-auto">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-8">
                                Introducing Wealth Oven Leases — Zero Upfront
                            </h2>
                            <p className="text-lg text-muted-foreground mb-10">
                                We build complete business systems (Wealth
                                Ovens) you can use instantly. Instead of paying
                                thousands upfront, you lease it at no cost — and
                                we share in the revenue only if it works.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 text-left mt-12">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-semibold mb-6">
                                        With leasing, you get:
                                    </h3>

                                    {[
                                        "$0 Upfront → No big investment to test.",
                                        "Performance-Based → You only share profit if the system works.",
                                        "Ready-to-Run → Built, tested, and optimized before you touch it.",
                                        "Buyout Option → Own it forever (18 months avg. revenue or $10k).",
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start">
                                            <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                                            <p className="text-muted-foreground">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-primary/5 p-8 rounded-lg border border-primary/10">
                                    <h3 className="text-2xl font-semibold mb-6 text-primary">
                                        Risk-Free Advantage
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Unlike traditional business investments
                                        where you risk thousands upfront, our
                                        lease model ensures you only pay when
                                        the system is already generating profit
                                        for you.
                                    </p>
                                    <div className="flex items-center mt-6">
                                        <Shield className="h-8 w-8 text-primary mr-3" />
                                        <span className="font-semibold">
                                            Your capital stays protected
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 px-4 bg-muted/30">
                    <div className="container max-w-6xl mx-auto">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-8">
                                How It Works (3 Simple Steps)
                            </h2>

                            <div className="grid md:grid-cols-3 gap-6 mt-12">
                                {[
                                    {
                                        icon: Zap,
                                        title: "Pick a Wealth Oven",
                                        desc: "Choose from available systems in our marketplace",
                                    },
                                    {
                                        icon: TrendingUp,
                                        title: "Plug In Your Offer",
                                        desc: "We adapt it to your product or service",
                                    },
                                    {
                                        icon: DollarSign,
                                        title: "Run Ads",
                                        desc: "You cover ad spend. If the Oven bakes profit, we share in the upside",
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center p-6 rounded-lg border bg-background">
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
                    </div>
                </section>

                {/* Guarantee Section */}
                <section className="py-16 px-4">
                    <div className="container max-w-6xl mx-auto">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="bg-success/10 p-8 rounded-lg border border-success/20">
                                <h2 className="text-3xl font-bold mb-6">
                                    Risk-Free Guarantee
                                </h2>
                                <p className="text-lg text-muted-foreground mb-4">
                                    If it doesn't make money, you don't owe us a
                                    cent.
                                </p>
                                <p className="text-muted-foreground">
                                    That's the power of $0 upfront leasing —
                                    you're not gambling with your savings.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 bg-primary/5">
                    <div className="container max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Test a Wealth Oven Today — Zero Risk
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8">
                            Join the growing number of entrepreneurs who are
                            building profitable businesses without upfront
                            costs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="text-lg px-8"
                                onClick={() => setLeasingModalOpen(true)}>
                                Start Leasing Now{" "}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8"
                                asChild>
                                <Link href="/how-it-works">Learn More</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Leasing Modal */}
            <LeasingModal
                open={leasingModalOpen}
                onOpenChange={setLeasingModalOpen}
            />
        </div>
    );
}