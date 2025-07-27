"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { database } from "@/lib/database"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import AdvancedNavbar from "@/components/advanced-navbar"
import RevolutionaryHero from "@/components/revolutionary-hero"
import AIPoweredDashboard from "@/components/ai-powered-dashboard"
import SupplierDashboard from "@/components/supplier-dashboard"
import ParticleBackground from "@/components/particle-background"
import CustomCursor from "@/components/custom-cursor"
import SellerItemForm from "@/components/seller-item-form"
import LiveMarketplace from "@/components/live-marketplace"



export default function Home() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [dbInitialized, setDbInitialized] = useState(false)

  // Initialize database on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await database.init()
        console.log("✅ Database initialized successfully")
        setDbInitialized(true)

        // Add some sample data if database is empty
        await initializeSampleData()
      } catch (error) {
        console.error("❌ Database initialization failed:", error)
        setDbInitialized(true) // Continue anyway
      }
    }

    initializeApp()
  }, [])

  const initializeSampleData = async () => {
    try {
      // Check if we already have data
      const existingItems = await database.getItems()
      if (existingItems.length > 0) {
        console.log("📦 Database already has data, skipping sample data")
        return
      }

      console.log("🌱 Adding sample data...")

      // Create sample sellers
      const seller1Id = await database.createUser({
        name: "Ram Singh",
        email: "ram.singh@example.com",
        phone: "+91 98765 43210",
        userType: "seller",
        location: {
          address: "Connaught Place, New Delhi",
          coordinates: { lat: 28.6315, lng: 77.2167 },
        },
        rating: 4.8,
        verified: true,
      })

      const seller2Id = await database.createUser({
        name: "Sunita Devi",
        email: "sunita.devi@example.com",
        phone: "+91 98765 43211",
        userType: "seller",
        location: {
          address: "Karol Bagh, New Delhi",
          coordinates: { lat: 28.6519, lng: 77.1909 },
        },
        rating: 4.6,
        verified: true,
      })

      // Create sample items
      const sampleItems = [
        {
          name: "Fresh Red Onions",
          category: "Vegetables",
          price: 25,
          quantity: 50,
          unit: "kg",
          quality: "Premium",
          description: "Fresh red onions, perfect for street food preparation",
          sellerId: seller1Id,
          organic: false,
        },
        {
          name: "Premium Potatoes",
          category: "Vegetables",
          price: 20,
          quantity: 75,
          unit: "kg",
          quality: "Standard",
          description: "High-quality potatoes, ideal for frying and cooking",
          sellerId: seller2Id,
          organic: false,
        },
        {
          name: "Organic Tomatoes",
          category: "Vegetables",
          price: 35,
          quantity: 30,
          unit: "kg",
          quality: "Premium",
          description: "Organic tomatoes, fresh from farm",
          sellerId: seller1Id,
          organic: true,
        },
        {
          name: "Green Chilies",
          category: "Vegetables",
          price: 40,
          quantity: 15,
          unit: "kg",
          quality: "Premium",
          description: "Fresh green chilies, perfect spice level",
          sellerId: seller2Id,
          organic: false,
        },
        {
          name: "Cooking Oil",
          category: "Oil & Ghee",
          price: 120,
          quantity: 20,
          unit: "L",
          quality: "Standard",
          description: "Refined cooking oil, suitable for deep frying",
          sellerId: seller1Id,
          organic: false,
        },
      ]

      for (const item of sampleItems) {
        await database.createItem(item)
      }

      console.log("✅ Sample data added successfully")
    } catch (error) {
      console.error("❌ Error adding sample data:", error)
    }
  }

  useEffect(() => {
    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed")
        }
      })
    }, observerOptions)

    const scrollElements = document.querySelectorAll(".scroll-reveal")
    scrollElements.forEach((el) => observer.observe(el))

    return () => {
      scrollElements.forEach((el) => observer.unobserve(el))
    }
  }, [user])

  if (loading || !dbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Loading VendorSaathi...</h2>
          <p className="text-gray-600">
            {!dbInitialized ? "Initializing database..." : "Preparing your AI-powered experience"}
          </p>
        </div>
      </div>
    )
  }

  // Show authentication forms if user is not logged in
  if (!user) {
    return (
      <>
        <ParticleBackground />
        <CustomCursor />
        {authMode === "login" ? (
          <LoginForm
            onToggleMode={() => setAuthMode("register")}
            language={language}
            onToggleLanguage={() => setLanguage(language === "en" ? "hi" : "en")}
          />
        ) : (
          <RegisterForm
            onToggleMode={() => setAuthMode("login")}
            language={language}
            onToggleLanguage={() => setLanguage(language === "en" ? "hi" : "en")}
          />
        )}
      </>
    )
  }

  // Main authenticated app
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <ParticleBackground />
      <CustomCursor />

      <AdvancedNavbar />
      <RevolutionaryHero />

      {/* Main Dashboard Section */}
      <section id="dashboard" className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <AIPoweredDashboard />
      </section>

      {/* User Type Specific Dashboard */}
      {user.type === "vendor" ? (
        <section id="vendor-features" className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Vendor Marketplace</h2>
              <p className="text-xl text-gray-600">Browse and purchase from live suppliers</p>
            </div>
            <LiveMarketplace />
          </div>
        </section>
      ) : user.type === "supplier" ? (
        <section id="supplier-features" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
          <SupplierDashboard />
        </section>
      ) : (
        // For sellers (new user type)
        <section id="seller-features" className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Seller Dashboard</h2>
              <p className="text-xl text-gray-600">List your items and manage your inventory</p>
            </div>
            <SellerItemForm />
          </div>
        </section>
      )}

      {/* Live Marketplace for All Users */}
      <section id="marketplace" className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Live Marketplace</h2>
            <p className="text-xl text-gray-600">Real-time marketplace with AI-powered insights</p>
          </div>
          <LiveMarketplace />
        </div>
      </section>
    </main>
  )
}
