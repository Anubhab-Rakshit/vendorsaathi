# VendorSaathi 

**AI-Powered Street Food Vendor Marketplace & Ecosystem**

VendorSaathi is a revolutionary platform that connects Indian street food vendors with suppliers through AI-powered insights, real-time marketplace data, and intelligent procurement optimization. Built with Next.js 15, TypeScript, and IndexedDB for a complete offline-first experience.

<img width="1480" height="706" alt="image" src="https://github.com/user-attachments/assets/7fbe4c8c-b098-4cc0-a9af-33c6d72f58f9" />




## Features

### AI-Powered Intelligence

- **Real-time AI Assistant** with live database integration
- **Demand Forecasting** using machine learning algorithms
- **Price Prediction** and market trend analysis
- **Smart Recommendations** for optimal purchasing decisions
- **Inventory Management** with AI-driven stock optimization


### Multi-User Ecosystem

- **Vendors**: Street food vendors who purchase ingredients
- **Sellers**: Individual sellers listing items in marketplace
- **Suppliers**: Bulk suppliers for wholesale transactions


### Advanced Financial Management

- **Real-time Balance System** with instant updates
- **Transaction Tracking** with complete audit trails
- **Purchase History** and spending analytics
- **Group Order Savings** calculation and optimization


### Live Marketplace

- **Real-time Item Listings** with instant updates
- **Advanced Search & Filtering** by category, price, location
- **Seller Ratings & Reviews** system
- **Live Inventory Updates** with stock notifications


### Real-time Features

- **Live Notifications** for purchases, listings, price changes
- **Real-time Chat** with AI assistant
- **Instant Balance Updates** after transactions
- **Live Market Data** with price fluctuations


## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Modern component library
- **Lucide React** - Beautiful icons


### Backend & Database

- **IndexedDB** - Client-side database for offline functionality
- **Real-time Services** - Custom WebSocket-like implementation
- **AI Integration** - Google Gemini API for intelligent features


### Key Libraries

- **React Hook Form** - Form management
- **Sonner** - Toast notifications
- **Framer Motion** - Smooth animations
- **Chart.js** - Data visualization


## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser with IndexedDB support


### Quick Start

```
# Clone the repository
git clone https://github.com/yourusername/vendorsaathi.git
cd vendorsaathi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Add your API keys to .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

###Environment Variables

```
# Required for AI features
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: For enhanced features
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=VendorSaathi
```


## Usage Guide

### For Vendors (Street Food Vendors)

1. **Registration**: Sign up as a "Vendor"
2. **Add Balance**: Use the balance management system to add funds
3. **Browse Marketplace**: Search and filter items by category, price
4. **Purchase Items**: Buy ingredients with real-time balance updates
5. **Manage Inventory**: Track purchased items and stock levels
6. **AI Insights**: Get demand predictions and price recommendations


### For Sellers (Individual Sellers)

1. **Registration**: Sign up as a "Seller"
2. **List Items**: Add your products to the marketplace
3. **Manage Inventory**: Update stock levels and prices
4. **Receive Orders**: Get notifications when vendors purchase
5. **Track Sales**: Monitor your sales performance


### For Suppliers (Bulk Suppliers)

1. **Registration**: Sign up as a "Supplier"
2. **Bulk Listings**: Add wholesale items for vendors
3. **Manage Orders**: Handle large quantity orders
4. **Analytics**: Track supplier performance metrics


## AI Features

### Intelligent Assistant

```
// AI Assistant provides real-time insights
- Marketplace analysis from live database
- Price trend predictions
- Inventory optimization suggestions
- Demand forecasting based on real data
```

### Smart Recommendations

- **Group Order Optimization**: AI suggests optimal group purchases
- **Price Alerts**: Notifications for price drops and deals
- **Demand Prediction**: Forecast ingredient demand patterns
- **Inventory Management**: Smart stock level recommendations


## ️ Database Schema

### Users Table

```
interface User {
  id: string
  name: string
  email: string
  phone: string
  type: 'vendor' | 'seller' | 'supplier'
  balance: number
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  verified: boolean
  rating: number
  createdAt: string
}
```


### Items Table

```typescript
interface Item {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  unit: string
  quality: string
  sellerId: string
  available: boolean
  organic: boolean
  createdAt: string
}
```

### Transactions Table

```typescript
interface Transaction {
  id: string
  buyerId: string
  sellerId: string
  itemId: string
  quantity: number
  totalAmount: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}
```

## UI/UX Features

### Modern Design System

- **Glass Morphism** effects throughout the interface
- **Smooth Animations** with Framer Motion
- **Responsive Design** for all device sizes
- **Dark/Light Mode** support
- **Accessibility** compliant components


### Interactive Elements

- **Hover Effects** and micro-interactions
- **Loading States** with skeleton screens
- **Toast Notifications** for user feedback
- **Modal Dialogs** for confirmations
- **Progress Indicators** for long operations


## Development

### Project Structure

```plaintext
vendorsaathi/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── auth/             # Authentication components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utility libraries
│   ├── database.ts       # IndexedDB operations
│   ├── auth.ts          # Authentication logic
│   └── utils.ts         # Helper functions
└── public/              # Static assets
```

### Key Components

#### Authentication System

```typescript
// Multi-role authentication with persistent sessions
- Login/Register forms with validation
- Role-based access control (Vendor/Seller/Supplier)
- Session management with localStorage
- User context with real-time updates
```

#### Database Layer

```
// IndexedDB wrapper with TypeScript
- CRUD operations for all entities
- Real-time data synchronization
- Offline-first architecture
- Transaction management
```

#### AI Integration

```
// Google Gemini API integration
- Real-time chat with marketplace data
- Demand prediction algorithms
- Price analysis and recommendations
- Smart inventory management
```

## Testing

### Demo Accounts

The application includes pre-configured demo accounts for testing:

**Vendor Account:**

- Email: `ram.vendor@gmail.com`
- Password: `demo123`
- Features: Purchase items, manage inventory, AI insights


**Seller Account:**

- Email: `sunita.seller@gmail.com`
- Password: `demo123`
- Features: List items, manage sales, track performance


**Supplier Account:**

- Email: `amit.supplier@gmail.com`
- Password: `demo123`
- Features: Bulk listings, wholesale management


### Testing Workflow

1. **Login** with any demo account
2. **Add Balance** (for vendors) using the balance management system
3. **List Items** (for sellers/suppliers) in the marketplace
4. **Purchase Items** and verify real-time balance updates
5. **Check Inventory** to see purchased items
6. **Test AI Features** by chatting with the assistant


## Deployment

### Vercel (Recommended)

```shellscript
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# Add NEXT_PUBLIC_GEMINI_API_KEY
```

### Other Platforms

- **Netlify**: Supports Next.js with edge functions
- **Railway**: Full-stack deployment with databases
- **Docker**: Containerized deployment option


## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request


### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design

## Roadmap

### Phase 1 (Current)

- ✅ Multi-user authentication system
- ✅ Real-time marketplace with IndexedDB
- ✅ AI-powered assistant with Gemini API
- ✅ Balance management and transactions
- ✅ Inventory management for vendors


### Phase 2 (Upcoming)

- 🔄 Mobile app with React Native
- 🔄 Payment gateway integration
- 🔄 GPS-based location services
- 🔄 Push notifications
- 🔄 Advanced analytics dashboard


### Phase 3 (Future)

- 📋 Multi-language support (Hindi, Tamil, etc.)
- 📋 Voice commands and speech recognition
- 📋 Blockchain-based supply chain tracking
- 📋 IoT integration for smart inventory
- 📋 Machine learning for price optimization

## Acknowledgments

- **Shadcn/UI** for the beautiful component library
- **Google Gemini** for AI capabilities
- **Vercel** for hosting and deployment
- **Next.js Team** for the amazing framework
- **Indian Street Food Vendors** for inspiration
