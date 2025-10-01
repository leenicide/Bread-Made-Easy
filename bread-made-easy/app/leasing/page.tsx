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
    Play,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { LeasingModal } from "@/components/lease/leasing-modal";
import { funnelService } from "@/lib/funnel-service";
import type { Funnel } from "@/lib/types";

export default function LeaseHomePage() {
    const [leasingModalOpen, setLeasingModalOpen] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoStatus, setVideoStatus] = useState("idle");
    const [availableFunnels, setAvailableFunnels] = useState<Funnel[]>([]);
    const [loadingFunnels, setLoadingFunnels] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Your Supabase video URL
    const videoUrl =
        "https://oedkzwoxhvitsbarbnck.supabase.co/storage/v1/object/public/funnels/riverside_earlwhite__%20sep%2018,%202025%20001_earlwhite_wolverine.mp4";
    const thumbnailUrl = "/thumbnail.png";

    useEffect(() => {
        loadAvailableFunnels();
    }, []);

    const loadAvailableFunnels = async () => {
        try {
            const allFunnels = await funnelService.getFunnelsWithCategories();
            const leaseFunnels = allFunnels.filter(funnel => 
                funnel.is_available_for_lease && funnel.active
            );
            setAvailableFunnels(leaseFunnels);
        } catch (error) {
            console.error("Error loading available funnels:", error);
        } finally {
            setLoadingFunnels(false);
        }
    };

    const handlePlayVideo = async () => {
        console.log("handlePlayVideo called!");
        setVideoPlaying(true);
        setVideoError(false);
        setVideoStatus("attempting to play");

        if (videoRef.current) {
            try {
                // Load the video first
                videoRef.current.load();

                // Wait for video to be ready
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Try to play
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    await playPromise;
                    console.log("Video play succeeded");
                }
            } catch (error) {
                console.error("Video play failed:", error);
                setVideoError(true);
                setVideoPlaying(false);
                setVideoStatus("play failed");
            }
        } else {
            console.error("Video ref is null!");
        }
    };

    const handleVideoError = () => {
        console.error("Video error handler called");
        setVideoError(true);
        setVideoPlaying(false);
        setVideoStatus("error");
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
                                🚀 Wealth Oven Leases
                            </h1>
                            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
                                A Done-for-You Business System With $0 Upfront
                                Cost
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
                                                    backgroundSize: "cover",
                                                    backgroundPosition:
                                                        "center",
                                                    backgroundColor: "#1f2937", // Fallback gray color
                                                }}
                                                onClick={(e) => {
                                                    console.log(
                                                        "Thumbnail area clicked!",
                                                        e
                                                    );
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handlePlayVideo();
                                                }}
                                                onMouseDown={(e) =>
                                                    console.log(
                                                        "Mouse down on thumbnail"
                                                    )
                                                }>
                                                {/* Play button */}
                                                <div
                                                    className="w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all duration-200 shadow-lg"
                                                    onClick={(e) => {
                                                        console.log(
                                                            "Play button clicked directly!",
                                                            e
                                                        );
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handlePlayVideo();
                                                    }}>
                                                    <Play className="w-10 h-10 text-white ml-1 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Removed the overlay that was blocking clicks */}
                                        </>
                                    ) : null}

                                    {/* Video element - improved with better attributes */}
                                    <video
                                        ref={videoRef}
                                        className={`w-full h-full ${
                                            videoPlaying && !videoError
                                                ? "block"
                                                : "hidden"
                                        }`}
                                        controls
                                        onError={handleVideoError}
                                        preload="metadata"
                                        crossOrigin="anonymous"
                                        playsInline
                                        controlsList="nodownload">
                                        <source
                                            src={videoUrl}
                                            type="video/mp4"
                                        />
                                        Your browser does not support the video
                                        tag.
                                    </video>
                                </div>

                                <p className="text-sm text-muted-foreground mt-2">
                                    Watch this video to see how Wealth Oven
                                    leasing works
                                </p>

                                {/* Enhanced error handling */}
                                {videoError && (
                                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                        <p className="text-sm text-destructive font-medium">
                                            Video failed to load. Status:{" "}
                                            {videoStatus}
                                        </p>
                                        <div className="mt-2 space-x-2">
                                            <button
                                                className="text-destructive underline text-sm hover:no-underline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    console.log(
                                                        "Retry button clicked"
                                                    );
                                                    setVideoError(false);
                                                    setVideoPlaying(false);
                                                    handlePlayVideo();
                                                }}>
                                                Try again
                                            </button>
                                            <span className="text-destructive/60">
                                                •
                                            </span>
                                            <a
                                                href={videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-destructive underline text-sm hover:no-underline">
                                                Open in new tab
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Debug info - remove this in production */}
                                {process.env.NODE_ENV === "development" && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Debug: {videoStatus} | Playing:{" "}
                                        {videoPlaying ? "Yes" : "No"} | Error:{" "}
                                        {videoError ? "Yes" : "No"}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="text-lg px-8"
                                    onClick={() => setLeasingModalOpen(true)}>
                                    Start Your Lease Today{" "}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8"
                                    asChild>
                                    <Link href="/strategy-call">
                                        Book a Free Strategy Call
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Available Funnels Section */}
                <section className="py-16 px-4 bg-background">
                    <div className="container max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">
                                Available Wealth Ovens
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Choose from our proven business systems ready for immediate leasing
                            </p>
                        </div>

                        {loadingFunnels ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Loading available funnels...</p>
                            </div>
                        ) : availableFunnels.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Zap className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No Funnels Available</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Check back soon for new Wealth Oven leasing opportunities.
                                    </p>
                                    <Button onClick={() => setLeasingModalOpen(true)}>
                                        Get Notified When New Ovens Launch
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableFunnels.map((funnel) => (
                                    <div
                                        key={funnel.id}
                                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card"
                                    >
                                        <div className="aspect-video bg-muted relative">
                                            {funnel.image_url ? (
                                                <img
                                                    src={funnel.image_url}
                                                    alt={funnel.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                    <Zap className="h-12 w-12 text-primary/40" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                                                    Available for Lease
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2">
                                                {funnel.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                                {funnel.description || "A proven Wealth Oven business system ready for your offer."}
                                            </p>
                                            
                                            {funnel.category && (
                                                <div className="mb-4">
                                                    <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                                                        {funnel.category.name}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-muted-foreground">
                                                    ID: {funnel.funnel_id}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setLeasingModalOpen(true)}
                                                >
                                                    Lease Now
                                                    <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* What Is Wealth Oven Section */}
                <section className="pt-2 pb-16 px-4 bg-muted/30">
                    <div className="container max-w-6xl mx-auto">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-8">
                                What Is a Wealth Oven?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                A Wealth Oven is a ready-to-run digital business
                                system. It's designed to take in leads and
                                consistently bake them into paying customers —
                                just like an oven takes dough and bakes bread.
                            </p>
                            <p className="text-lg text-muted-foreground">
                                Instead of wasting months (and thousands of
                                dollars) building, testing, and fixing funnels,
                                you can lease one instantly, risk-free.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ... rest of your existing sections remain the same ... */}

                {/* What You Get Section */}
                <section className="py-16 px-4">
                    <div className="container max-w-6xl mx-auto">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-12 text-center">
                                What You Get With a Wealth Oven Lease
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {[
                                        "$0 Upfront Setup – We build, test, and optimize the entire system for you at no charge.",
                                        "Proven System – Every Wealth Oven is built using the same strategies we use to generate revenue in real markets.",
                                        "Plug & Play Setup – Just plug in your product or service — everything else is ready to run.",
                                        "Automated Conversions – Opt-in pages, sales pages, checkout, upsells, and follow-up emails are all included.",
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

                                <div className="space-y-6">
                                    {[
                                        "Ad Management Support – Our ads team can run your traffic so you don't need to worry about targeting, testing, or scaling.",
                                        "Risk-Free Model – You only pay us when the Wealth Oven makes money.",
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

                                    <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 mt-6">
                                        <h3 className="font-semibold text-lg mb-3 text-primary">
                                            The Buyout Option
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            Love your Wealth Oven and want to
                                            keep it forever? You can buy it
                                            outright for 18 months of average
                                            profit OR $10,000 (whichever is
                                            higher). Until then, you lease with
                                            no upfront fee and unlimited earning
                                            potential.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ... rest of your existing sections ... */}

                {/* Final CTA Section */}
                <section className="py-20 px-4 bg-primary/5">
                    <div className="container max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Test a Wealth Oven?
                        </h2>

                        <div className="bg-background p-8 rounded-lg border shadow-sm mb-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                                <div className="text-center flex-1">
                                    <div className="font-bold text-lg mb-2">
                                        You bring the dough
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        (leads and ad spend)
                                    </p>
                                </div>

                                <div className="flex justify-center rotate-90 md:rotate-0">
                                    <ArrowRight className="h-8 w-8 text-primary" />
                                </div>

                                <div className="text-center flex-1">
                                    <div className="font-bold text-lg mb-2">
                                        We bring the oven
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        (the system)
                                    </p>
                                </div>

                                <div className="flex justify-center rotate-90 md:rotate-0">
                                    <ArrowRight className="h-8 w-8 text-primary" />
                                </div>

                                <div className="text-center flex-1">
                                    <div className="font-bold text-lg mb-2">
                                        Together we bake the bread
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        (sales and profit)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="text-lg px-8"
                                onClick={() => setLeasingModalOpen(true)}>
                                Start Your Lease Today{" "}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8"
                                asChild>
                                <Link href="/strategy-call">
                                    Book a Free Strategy Call
                                </Link>
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