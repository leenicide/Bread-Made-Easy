export const paymentService = {
  // For setting up payment methods (card storage)
  async createSetupIntent(params: {
    auctionId: string;
    buyerId: string;
  }): Promise<{
    success: boolean;
    error?: string;
    setupIntent?: any;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-setup-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      return { success: false, error: 'Failed to create setup intent' };
    }
  },

  // Save payment method to database
  async savePaymentMethod(paymentMethodData: {
    userId: string;
    stripePaymentMethodId: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  }): Promise<{
    success: boolean;
    error?: string;
    paymentMethod?: any;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/save-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(paymentMethodData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving payment method:', error);
      return { success: false, error: 'Failed to save payment method' };
    }
  },

  // For later charging the winner
  async createPaymentIntent(amount: number, currency: string, params: {
    auctionId: string;
    buyerId: string;
    paymentMethodId: string;
  }): Promise<{
    success: boolean;
    error?: string;
    paymentIntent?: any;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ amount, currency, ...params }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { success: false, error: 'Failed to create payment intent' };
    }
  },
};