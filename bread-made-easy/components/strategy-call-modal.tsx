// components/strategy-call-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Mail, Phone, Building, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { strategyCallService } from "@/lib/call-service";

interface StrategyCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Available time slots
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", 
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

// Get available business days (next 14 days, excluding weekends)
const getAvailableDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(date);
    }
  }
  
  return days;
};

export function StrategyCallModal({ open, onOpenChange }: StrategyCallModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    company: "",
    preferredDate: "",
    preferredTimeSlot: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Auto-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        name: user.display_name || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.preferredDate || !formData.preferredTimeSlot) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please provide a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Convert the date string back to ISO string for the API
      const selectedDate = new Date(formData.preferredDate);
      
      const bookingData = {
        user_id: user?.id || null,
        email: formData.email,
        phone_number: formData.phoneNumber || null,
        name: formData.name,
        company: formData.company || null,
        preferred_date: selectedDate.toISOString(), // Convert to ISO string for API
        preferred_time_slot: formData.preferredTimeSlot,
        timezone: formData.timezone
      };

      const booking = await strategyCallService.createBooking(bookingData);
      
      if (booking) {
        alert("Strategy call booked successfully! We'll contact you to confirm the details.");
        onOpenChange(false);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          company: "",
          preferredDate: "",
          preferredTimeSlot: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error booking strategy call:', error);
      alert(error instanceof Error ? error.message : "Failed to book strategy call. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const availableDays = getAvailableDays();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book a Free Strategy Call
          </DialogTitle>
          <DialogDescription>
            Let's discuss how Wealth Oven can help grow your business. Choose a time that works for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name (optional)"
            />
          </div>

          {/* Preferred Date */}
          <div className="space-y-2">
            <Label htmlFor="preferredDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preferred Date *
            </Label>
            <select
              id="preferredDate"
              value={formData.preferredDate}
              onChange={(e) => handleInputChange('preferredDate', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a date</option>
              {availableDays.map((date) => (
                <option key={date.toDateString()} value={date.toDateString()}>
                  {date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Time Slot */}
          <div className="space-y-2">
            <Label htmlFor="preferredTimeSlot" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Time *
            </Label>
            <select
              id="preferredTimeSlot"
              value={formData.preferredTimeSlot}
              onChange={(e) => handleInputChange('preferredTimeSlot', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a time</option>
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Timezone: {formData.timezone}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking Your Call...
              </>
            ) : (
              'Book Strategy Call'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            We'll contact you within 24 hours to confirm your appointment.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}