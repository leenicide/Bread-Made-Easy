// components/leasing/leasing-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    X,
    Star,
    Crown,
    Target,
    Users,
    Scale,
    Gem,
    Zap,
    DollarSign,
    Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface FormData {
    email: string;
    name: string;
    company: string;
    phone: string;
    projectType: string;
    industry: string;
    targetAudience: string;
    primaryGoal: string;
    pages: string[];
    features: string[];
    integrations: string[];
    inspiration: string;
    additionalNotes: string;
    preferredContact: string;
}

const initialFormData: FormData = {
    email: "",
    name: "",
    company: "",
    phone: "",
    projectType: "",
    industry: "",
    targetAudience: "",
    primaryGoal: "",
    pages: [],
    features: [],
    integrations: [],
    inspiration: "",
    additionalNotes: "",
    preferredContact: "email",
};

const steps = [
    { id: 1, title: "Contact Info", description: "How can we reach you?" },
    {
        id: 2,
        title: "Project Overview",
        description: "Tell us about your project",
    },
    { id: 3, title: "Requirements", description: "What do you need?" },
    {
        id: 4,
        title: "Final Details",
        description: "Anything else we should know?",
    },
];

const pageOptions = [
    "Landing Page",
    "Sales Page",
    "Checkout Page",
    "Thank You Page",
    "Upsell Page",
    "Email Capture",
    "Webinar Registration",
    "Product Catalog",
    "About Page",
    "Contact Page",
];

const featureOptions = [
    "Email Integration",
    "Payment Processing",
    "CRM Integration",
    "Analytics Tracking",
    "A/B Testing",
    "Mobile Optimization",
    "SEO Optimization",
    "Social Media Integration",
    "Live Chat",
    "Multi-language Support",
];

const integrationOptions = [
    "Mailchimp",
    "ConvertKit",
    "HubSpot",
    "Salesforce",
    "Stripe",
    "PayPal",
    "Zapier",
    "Google Analytics",
    "Facebook Pixel",
    "Calendly",
];

interface LeasingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeasingModal({
    open,
    onOpenChange,
}: LeasingModalProps) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Prefill email if user is logged in
    if (user && user.email && !formData.email) {
        setFormData((prev) => ({ ...prev, email: user.email }));
    }

    const progress = (currentStep / steps.length) * 100;

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const toggleArrayItem = (field: keyof FormData, item: string) => {
        const currentArray = formData[field] as string[];
        const newArray = currentArray.includes(item)
            ? currentArray.filter((i) => i !== item)
            : [...currentArray, item];
        updateFormData(field, newArray);
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.email) newErrors.email = "Email is required";
                if (!user && !formData.name)
                    newErrors.name = "Name is required";
                break;
            case 2:
                if (!formData.projectType)
                    newErrors.projectType = "Project type is required";
                if (!formData.industry)
                    newErrors.industry = "Industry is required";
                if (!formData.primaryGoal)
                    newErrors.primaryGoal = "Primary goal is required";
                break;
            case 3:
                if (formData.pages.length === 0)
                    newErrors.pages = "Select at least one page type";
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setLoading(true);
        setSubmitError(null);
        
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit request:", error);
            setSubmitError(error instanceof Error ? error.message : "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset form after a delay to allow the modal to close smoothly
        setTimeout(() => {
            setCurrentStep(1);
            setFormData(initialFormData);
            setSubmitted(false);
            setSubmitError(null);
        }, 300);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    updateFormData("email", e.target.value)
                                }
                                placeholder="john@company.com"
                                disabled={!!user}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {!user && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        updateFormData("name", e.target.value)
                                    }
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="company">Company Name</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) =>
                                    updateFormData("company", e.target.value)
                                }
                                placeholder="Your Company Inc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    updateFormData("phone", e.target.value)
                                }
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Project Type *</Label>
                            <Select
                                value={formData.projectType}
                                onValueChange={(value) =>
                                    updateFormData("projectType", value)
                                }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lead-generation">
                                        Lead Generation Funnel
                                    </SelectItem>
                                    <SelectItem value="sales-funnel">
                                        Sales Funnel
                                    </SelectItem>
                                    <SelectItem value="ecommerce">
                                        E-commerce Store
                                    </SelectItem>
                                    <SelectItem value="course-launch">
                                        Course Launch
                                    </SelectItem>
                                    <SelectItem value="webinar-funnel">
                                        Webinar Funnel
                                    </SelectItem>
                                    <SelectItem value="membership-site">
                                        Membership Site
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.projectType && (
                                <p className="text-sm text-destructive">
                                    {errors.projectType}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Industry *</Label>
                            <Select
                                value={formData.industry}
                                onValueChange={(value) =>
                                    updateFormData("industry", value)
                                }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="saas">SaaS</SelectItem>
                                    <SelectItem value="ecommerce">
                                        E-commerce
                                    </SelectItem>
                                    <SelectItem value="coaching">
                                        Coaching
                                    </SelectItem>
                                    <SelectItem value="consulting">
                                        Consulting
                                    </SelectItem>
                                    <SelectItem value="real-estate">
                                        Real Estate
                                    </SelectItem>
                                    <SelectItem value="fitness">
                                        Health & Fitness
                                    </SelectItem>
                                    <SelectItem value="education">
                                        Education
                                    </SelectItem>
                                    <SelectItem value="finance">
                                        Finance
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.industry && (
                                <p className="text-sm text-destructive">
                                    {errors.industry}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetAudience">
                                Target Audience
                            </Label>
                            <Textarea
                                id="targetAudience"
                                value={formData.targetAudience}
                                onChange={(e) =>
                                    updateFormData(
                                        "targetAudience",
                                        e.target.value
                                    )
                                }
                                placeholder="Describe your ideal customer..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="primaryGoal">Primary Goal *</Label>
                            <Textarea
                                id="primaryGoal"
                                value={formData.primaryGoal}
                                onChange={(e) =>
                                    updateFormData(
                                        "primaryGoal",
                                        e.target.value
                                    )
                                }
                                placeholder="What do you want to achieve with this funnel?"
                                rows={3}
                            />
                            {errors.primaryGoal && (
                                <p className="text-sm text-destructive">
                                    {errors.primaryGoal}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label>Pages Needed *</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {pageOptions.map((page) => (
                                    <div
                                        key={page}
                                        className="flex items-center space-x-2">
                                        <Checkbox
                                            id={page}
                                            checked={formData.pages.includes(
                                                page
                                            )}
                                            onCheckedChange={() =>
                                                toggleArrayItem("pages", page)
                                            }
                                        />
                                        <Label
                                            htmlFor={page}
                                            className="text-sm">
                                            {page}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.pages && (
                                <p className="text-sm text-destructive">
                                    {errors.pages}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label>Features Required</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {featureOptions.map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center space-x-2">
                                        <Checkbox
                                            id={feature}
                                            checked={formData.features.includes(
                                                feature
                                            )}
                                            onCheckedChange={() =>
                                                toggleArrayItem(
                                                    "features",
                                                    feature
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={feature}
                                            className="text-sm">
                                            {feature}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="inspiration">
                                Inspiration/References
                            </Label>
                            <Textarea
                                id="inspiration"
                                value={formData.inspiration}
                                onChange={(e) =>
                                    updateFormData(
                                        "inspiration",
                                        e.target.value
                                    )
                                }
                                placeholder="Share any websites, designs, or examples you like..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additionalNotes">
                                Additional Notes
                            </Label>
                            <Textarea
                                id="additionalNotes"
                                value={formData.additionalNotes}
                                onChange={(e) =>
                                    updateFormData(
                                        "additionalNotes",
                                        e.target.value
                                    )
                                }
                                placeholder="Any other requirements or information..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Preferred Contact Method</Label>
                            <RadioGroup
                                value={formData.preferredContact}
                                onValueChange={(value) =>
                                    updateFormData("preferredContact", value)
                                }>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="email"
                                        id="email-contact"
                                    />
                                    <Label htmlFor="email-contact">Email</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="phone"
                                        id="phone-contact"
                                    />
                                    <Label htmlFor="phone-contact">
                                        Phone Call
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="video"
                                        id="video-contact"
                                    />
                                    <Label htmlFor="video-contact">
                                        Video Call
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                We'll review your request and get back to you
                                within 24 hours with a detailed proposal and
                                timeline.
                            </AlertDescription>
                        </Alert>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderThankYou = () => (
        <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Lease Request Submitted!</h3>
            <p className="text-muted-foreground mb-6">
                Thank you for your interest in our Wealth Oven leasing program. Our
                team will contact you within 24 hours to discuss your project.
            </p>
            <Button onClick={handleClose}>Close</Button>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Wealth Oven Leasing Request
                    </DialogTitle>
                    <DialogDescription>
                        Start with $0 upfront - we only profit when you do
                    </DialogDescription>
                </DialogHeader>

                {submitError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                {!submitted ? (
                    <>
                        {/* Benefits Section */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Why Lease a Wealth Oven?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2">
                                    <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">$0 Upfront</h4>
                                        <p className="text-sm text-muted-foreground">
                                            No big investment to test. Start risk-free.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Performance-Based</h4>
                                        <p className="text-sm text-muted-foreground">
                                            You only share profit if the system works.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Ready-to-Run</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Built, tested, and optimized before you touch it.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Crown className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Buyout Option</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Own it forever (18 months avg. revenue or $10k).
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    {steps[currentStep - 1].title}
                                </h2>
                                <Badge variant="outline">
                                    Step {currentStep} of {steps.length}
                                </Badge>
                            </div>

                            <Progress value={progress} className="h-2" />

                            <div className="flex items-center justify-between text-sm">
                                {steps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`flex flex-col items-center gap-1 ${
                                            step.id === currentStep
                                                ? "text-primary font-medium"
                                                : step.id < currentStep
                                                ? "text-green-600"
                                                : "text-muted-foreground"
                                        }`}>
                                        <div
                                            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                                                step.id === currentStep
                                                    ? "bg-primary text-primary-foreground"
                                                    : step.id < currentStep
                                                    ? "bg-green-600 text-white"
                                                    : "bg-muted"
                                            }`}>
                                            {step.id < currentStep ? (
                                                <CheckCircle className="h-3 w-3" />
                                            ) : (
                                                step.id
                                            )}
                                        </div>
                                        <span className="hidden sm:inline">
                                            {step.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {steps[currentStep - 1].title}
                                </CardTitle>
                                <CardDescription>
                                    {steps[currentStep - 1].description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>{renderStep()}</CardContent>
                        </Card>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="bg-transparent">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>

                            {currentStep < steps.length ? (
                                <Button onClick={nextStep}>
                                    Next
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}>
                                    {loading
                                        ? "Submitting..."
                                        : "Submit Lease Request"}
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    renderThankYou()
                )}
            </DialogContent>
        </Dialog>
    );
}