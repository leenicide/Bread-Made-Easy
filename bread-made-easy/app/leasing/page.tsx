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
import { useState, useRef, useEffect } from "react";
import { LeasingModal } from "@/components/lease/leasing-modal";

export default function LeaseHomePage() {
    const [leasingModalOpen, setLeasingModalOpen] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoStatus, setVideoStatus] = useState('idle');
    const videoRef = useRef(null);

    // Your Supabase video URL
    const videoUrl = "https://oedkzwoxhvitsbarbnck.supabase.co/storage/v1/object/public/funnels/riverside_earlwhite__%20sep%2018,%202025%20001_earlwhite_wolverine.mp4";
    const thumbnailUrl = "/thumbnail.png";

    const handlePlayVideo = async () => {
        console.log('handlePlayVideo called!');
        setVideoPlaying(true);
        setVideoError(false);
        setVideoStatus('attempting to play');
        
        if (videoRef.current) {
            try {
                // Load the video first
                videoRef.current.load();
                
                // Wait for video to be ready
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Try to play
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    await playPromise;
                    console.log('Video play succeeded');
                }
            } catch (error) {
                console.error('Video play failed:', error);
                setVideoError(true);
                setVideoPlaying(false);
                setVideoStatus('play failed');
            }
        } else {
            console.error('Video ref is null!');
        }
    };

    const handleVideoError = () => {
        console.error('Video error handler called');
        setVideoError(true);
        setVideoPlaying(false);
        setVideoStatus('error');
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

                            {/* VSL Player - Updated with better click handling */}
                            <div className="my-10 mx-auto max-w-3xl">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl relative">
                                    {!videoPlaying || videoError ? (
                                        <>
                                            {/* Video thumbnail with play button - Fixed click handling */}
                                            <div
                                                className="absolute inset-0 cursor-pointer flex items-center justify-center z-20"
                                                style={{
                                                    backgroundImage: `url('${thumbnailUrl}')`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    backgroundColor: '#1f2937' // Fallback gray color
                                                }}
                                                onClick={(e) => {
                                                    console.log('Thumbnail area clicked!', e);
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handlePlayVideo();
                                                }}
                                                onMouseDown={(e) => console.log('Mouse down on thumbnail')}
                                            >
                                                {/* Play button */}
                                                <div 
                                                    className="w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all duration-200 shadow-lg"
                                                    onClick={(e) => {
                                                        console.log('Play button clicked directly!', e);
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handlePlayVideo();
                                                    }}
                                                >
                                                    <svg
                                                        className="w-10 h-10 text-white ml-1 pointer-events-none"
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

                                            {/* Removed the overlay that was blocking clicks */}
                                        </>
                                    ) : null}
                                    
                                    {/* Video element - improved with better attributes */}
                                    <video
                                        ref={videoRef}
                                        className={`w-full h-full ${videoPlaying && !videoError ? 'block' : 'hidden'}`}
                                        controls
                                        onError={handleVideoError}
                                        preload="metadata"
                                        crossOrigin="anonymous"
                                        playsInline
                                        controlsList="nodownload"
                                    >
                                        <source
                                            src={videoUrl}
                                            type="video/mp4"
                                        />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mt-2">
                                    Watch this video to see how Wealth Oven leasing works
                                </p>
                                
                                {/* Enhanced error handling */}
                                {videoError && (
                                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                        <p className="text-sm text-destructive font-medium">
                                            Video failed to load. Status: {videoStatus}
                                        </p>
                                        <div className="mt-2 space-x-2">
                                            <button 
                                                className="text-destructive underline text-sm hover:no-underline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    console.log('Retry button clicked');
                                                    setVideoError(false);
                                                    setVideoPlaying(false);
                                                    handlePlayVideo();
                                                }}
                                            >
                                                Try again
                                            </button>
                                            <span className="text-destructive/60">•</span>
                                            <a 
                                                href={videoUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-destructive underline text-sm hover:no-underline"
                                            >
                                                Open in new tab
                                            </a>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Debug info - remove this in production */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Debug: {videoStatus} | Playing: {videoPlaying ? 'Yes' : 'No'} | Error: {videoError ? 'Yes' : 'No'}
                                    </div>
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