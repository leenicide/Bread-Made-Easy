"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle,
    Zap,
    Play,
    Shield,
    Users,
    Target,
    TrendingUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LeasingModal } from "@/components/lease/leasing-modal";
import { funnelService } from "@/lib/funnel-service";
import type { Funnel } from "@/lib/types";
import { StrategyCallModal } from "@/components/strategy-call-modal";

export default function LeaseHomePage() {
    const [leasingModalOpen, setLeasingModalOpen] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoStatus, setVideoStatus] = useState("idle");
    const [availableFunnels, setAvailableFunnels] = useState<Funnel[]>([]);
    const [loadingFunnels, setLoadingFunnels] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [strategyCallModalOpen, setStrategyCallModalOpen] = useState(false);

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
                <section className="py-20 px-4">
                    <div className="container max-w-6xl mx-auto text-center">
                        <div className="max-w-3xl mx-auto mb-8">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Wealth Oven Leases
                            </h1>
                            <p className="text-2xl md:text-3xl text-muted-foreground mb-8 leading-relaxed font-medium">
                                So you wanna make money online huh? Join the club!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button 
                                    size="lg" 
                                    className="text-lg px-8" 
                                    onClick={() => setLeasingModalOpen(true)}
                                >
                                    Lease a Wealth Oven Today
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className="text-lg px-8"
                                    onClick={() => setStrategyCallModalOpen(true)}
                                >
                                    Book Strategy Call
                                </Button>
                            </div>
                        </div>

                        
                    </div>
                </section>

                {/* Two Types Section */}
                <section className="py-16 px-4 bg-muted/30">
                    <div className="container max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-6">
                                The Two Types of Online Entrepreneurs
                            </h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-card border rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <TrendingUp className="h-8 w-8 text-primary mr-3" />
                                    <h3 className="text-xl font-bold">The "Secret Knowers"</h3>
                                </div>
                                <p className="text-muted-foreground">
                                    Those who know the secrets of online marketing and implement systems that allow them to execute these secrets and go on to make millions upon millions of dollars!
                                </p>
                            </div>
                            
                            <div className="bg-card border rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <Target className="h-8 w-8 text-primary mr-3" />
                                    <h3 className="text-xl font-bold">The "Other Type"</h3>
                                </div>
                                <p className="text-muted-foreground">
                                    Those who for some reason despite putting in just as much or more effort than their secret-having counterparts cant seem to make their dreams of gaining financial freedom a reality.
                                </p>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-8 mb-8">
                            <h3 className="text-2xl font-bold mb-4 text-center">
                                If You're The "Other Type" of Online Entrepreneur...
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-destructive mb-2">The Bad News:</h4>
                                    <p className="text-muted-foreground">
                                        You'll never get back the time or the money you've wasted trying all the get rich quick schemes known to man, whether it was drop shipping, affiliate marketing or any other get rich quick scheme.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-primary mb-2">The Good News:</h4>
                                    <div className="space-y-2 text-muted-foreground">
                                        <div className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                            <p>You're not alone</p>
                                        </div>
                                        <div className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                            <p>You've come to the right place</p>
                                        </div>
                                        <div className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                            <p>We're here to help</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Secrets Section */}
                <section className="py-16 px-4">
                    <div className="container max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">
                                The "Secrets" Millionaire Online Entrepreneurs Know
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                That you probably don't...
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    letter: "A",
                                    title: "Your Product Isn't The Most Important Factor",
                                    description: "The product you are selling is not the most influential factor that determines your success selling online."
                                },
                                {
                                    letter: "B",
                                    title: "Traffic Is King",
                                    description: "You can have the most immaculate and well designed product but if no-one has heard about it or seen it, then it will not generate any revenue for you."
                                },
                                {
                                    letter: "C",
                                    title: "A Business Without A System Is A Job",
                                    description: "If you can only make money online when you have to sit there and be hands on then you might aswell go and work at Kmart, at least you will have health benefits."
                                },
                                {
                                    letter: "D",
                                    title: "System + Traffic Beats Product Quality",
                                    description: "A bad product in combination with a great system and a lot of traffic will outperform a Phenomenal Product with a lacking system and minimal traffic 9 times out of 10."
                                }
                            ].map((secret, index) => (
                                <div key={index} className="bg-card border rounded-lg p-6">
                                    <div className="flex items-start mb-4">
                                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                                            {secret.letter}
                                        </div>
                                        <h3 className="text-lg font-bold">{secret.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground">{secret.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12 p-6 bg-muted rounded-lg border">
                            <p className="text-lg font-bold mb-2">
                                I hope you didn't fall for that!
                            </p>
                            <p className="text-muted-foreground">
                                I left one crucial element out... <span className="font-bold text-primary">the system</span>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Missing Element Section */}
                <section className="py-16 px-4 bg-muted/30">
                    <div className="container max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-6">
                                The Missing Element: Where To Find The Perfect System
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Where does one go to find such a system that will allow them to actually start their journey towards wealth accumulation, abundance and joy?
                            </p>
                            <p className="text-2xl font-bold text-primary">
                                Well, you've come to the right place.
                            </p>
                        </div>

                        <div className="bg-primary text-white rounded-2xl p-8 text-center">
                            <h3 className="text-3xl font-bold mb-4">
                                INTRODUCING WEALTH OVENS
                            </h3>
                            <p className="text-xl mb-6">
                                A complete plug and play business solution for people who want the Wealth without the headache.
                            </p>
                            <div className="space-y-4 text-lg">
                                <p>Supply us with your product and some promotional assets</p>
                                <p>We handle everything else</p>
                                <p>Start generating revenue immediately</p>
                            </div>
                        </div>

                        <div className="text-center mt-12 bg-card border rounded-lg p-8">
                            <h3 className="text-2xl font-bold mb-4">
                                And Here's The Best Part...
                            </h3>
                            <p className="text-lg text-muted-foreground mb-4">
                                You can lease a Wealth Oven today absolutely free as long as you're willing to invest some capital into the management and distribution of your advertisements!
                            </p>
                            <p className="text-sm text-muted-foreground">
                                We'll take care of the rest!
                            </p>
                        </div>
                    </div>
                </section>

                {/* Available Funnels Section */}
                <section className="py-16 px-4">
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

                {/* Final CTA Section */}
                <section className="py-20 px-4 bg-primary/5">
                    <div className="container max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            So What Are You Waiting For?
                        </h2>

                        <div className="bg-background p-8 rounded-lg border shadow-sm mb-8">
                            <div className="max-w-2xl mx-auto">
                                <p className="text-lg text-muted-foreground mb-6">
                                    Click the link below and <span className="font-bold text-primary">LEASE A WEALTH OVEN TODAY</span>
                                </p>
                                <div className="text-sm text-muted-foreground">
                                    <p>Terms and conditions apply.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="text-lg px-8"
                                onClick={() => setLeasingModalOpen(true)}>
                                Lease a Wealth Oven Today
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8"
                                onClick={() => setStrategyCallModalOpen(true)}>
                                Book a Free Strategy Call
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modals */}
            <LeasingModal
                open={leasingModalOpen}
                onOpenChange={setLeasingModalOpen}
            />
            <StrategyCallModal
                open={strategyCallModalOpen}
                onOpenChange={setStrategyCallModalOpen}
            />
        </div>
    );
}