# Bread Made Easy

A funnel-driven web application that combines auctions, direct sales, and upsell flows to sell ready-made sales funnels.

## Overview

Bread Made Easy is a marketplace platform that enables users to:
- Participate in live auctions for sales funnels
- Make direct purchases of available funnels
- Submit custom funnel requests
- Receive upsell opportunities after auction participation

## Features

### For Visitors/Users
- **Auction Participation**: Join live auctions with email and card pre-authorization
- **Direct Purchases**: Instant checkout for available funnels
- **Custom Requests**: Submit tailored funnel requirements
- **Upsell Flows**: Alternative options presented after auction losses

### For Admins
- **Auction Management**: Create, edit, and delete auctions
- **Bid Management**: Monitor and manually select auction winners
- **Lead Management**: View and export all leads and purchases
- **Dashboard**: Comprehensive overview of platform activity

## Tech Stack

- **Frontend**: React.js with modern UI components
- **Backend**: Supabase for authentication and database
- **Payments**: Stripe integration for pre-authorizations and checkout
- **Deployment**: Vercel/Netlify (compatible)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/bread-made-easy.git
cd bread-made-easy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Add your Supabase and Stripe keys to the environment file.

4. Run the development server:
```bash
npm run dev
```

## Configuration

### Supabase Setup
1. Create a new project at [Supabase](https://supabase.com)
2. Get your API keys and database URL
3. Update the environment variables

### Stripe Setup
1. Create a Stripe account at [Stripe](https://stripe.com)
2. Obtain your publishable and secret keys
3. Configure webhooks for payment events
4. Update the environment variables

## Usage

### For Users
1. Visit the landing page to see featured auctions and funnels
2. Participate in auctions by providing email and card details
3. Make direct purchases through Stripe checkout
4. Submit custom requests for tailored solutions

### For Admins
1. Access the admin dashboard at `/admin`
2. Manage auctions, bids, and winners
3. Export leads and purchase data
4. Monitor platform activity and performance

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For support, email support@breadmadeeasy.com or join our Slack channel.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced auction features (auto-bidding)
- [ ] Affiliate program integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## Acknowledgments

- Supabase team for the excellent backend platform
- Stripe for seamless payment processing
- The React community for extensive component libraries
