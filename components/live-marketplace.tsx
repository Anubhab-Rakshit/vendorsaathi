"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { database } from "@/lib/database"
import { realtimeService } from "@/lib/realtime-service"
import { useAuth } from "@/lib/auth"
import { notificationService } from "@/lib/notification-service"
import {
  ShoppingCart,
  Search,
  Filter,
  MapPin,
  Star,
  Phone,
  Clock,
  Package,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  MessageCircle,
  Zap,
  Heart,
  TrendingUp,
} from "lucide-react"

interface MarketItem {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  unit: string
  quality: string
  description: string
  sellerId: string
  sellerName: string
  sellerRating: number
  sellerPhone: string
  sellerLocation: string
  available: boolean
  organic: boolean
  harvestDate?: string
  createdAt: string
  views: number
  inquiries: number
}

export default function LiveMarketplace() {
  const { user, setUser } = useAuth()
  const [items, setItems] = useState<MarketItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [purchaseStatus, setPurchaseStatus] = useState<{ [key: string]: "idle" | "purchasing" | "success" | "error" }>(
    {},
  )

  useEffect(() => {
    loadMarketplaceItems()

    // Listen for real-time updates
    const unsubscribe = realtimeService.on("new_item_listed", (data) => {
      console.log("🔄 New item listed, refreshing marketplace:", data)
      loadMarketplaceItems()
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchTerm, selectedCategory, priceRange])

  const loadMarketplaceItems = async () => {
    try {
      setLoading(true)
      const allItems = await database.getItems({ available: true })
      console.log(`📦 Loaded ${allItems.length} marketplace items`)
      setItems(allItems)
    } catch (error) {
      console.error("❌ Error loading marketplace items:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Price filter
    filtered = filtered.filter((item) => item.price >= priceRange.min && item.price <= priceRange.max)

    setFilteredItems(filtered)
  }

  // FIXED: Enhanced purchase with balance update and lively animations
  const handlePurchase = async (item: MarketItem, requestedQuantity = 1) => {
    if (!user) {
      alert("Please login to purchase items")
      return
    }

    if (user.type !== "vendor") {
      alert("Only vendors can purchase items from sellers")
      return
    }

    if (user.id === item.sellerId) {
      alert("You cannot purchase your own items")
      return
    }

    // Set purchasing status with animation
    setPurchaseStatus({ ...purchaseStatus, [item.id]: "purchasing" })

    try {
      console.log(`🛒 Starting ENHANCED purchase process for item: ${item.name}`)

      // Check vendor balance
      const vendor = await database.getUser(user.id)
      const totalCost = item.price * requestedQuantity

      if (!vendor || vendor.balance < totalCost) {
        throw new Error(`Insufficient balance. Required: ₹${totalCost}, Available: ₹${vendor?.balance || 0}`)
      }

      console.log(`💰 Vendor balance check passed: ₹${vendor.balance} >= ₹${totalCost}`)

      // Add some delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create transaction
      const transactionData = {
        buyerId: user.id,
        sellerId: item.sellerId,
        itemId: item.id,
        itemName: item.name,
        quantity: requestedQuantity,
        pricePerUnit: item.price,
        totalAmount: totalCost,
        category: item.category,
        status: "completed",
      }

      console.log("💳 Creating transaction:", transactionData)

      const transactionId = await database.createTransaction(transactionData)

      console.log("✅ Transaction created:", transactionId)

      // Update item availability if fully purchased
      if (requestedQuantity >= item.quantity) {
        await database.updateItem(item.id, {
          available: false,
          quantity: 0,
        })
        console.log("📦 Item marked as sold out")
      } else {
        await database.updateItem(item.id, {
          quantity: item.quantity - requestedQuantity,
        })
        console.log(`📦 Item quantity updated: ${item.quantity} -> ${item.quantity - requestedQuantity}`)
      }

      // CRITICAL FIX: Update user balance in context after purchase
      const updatedVendor = await database.getUser(user.id)
      if (updatedVendor) {
        console.log(`💰 Updating user context balance: ${user.balance} -> ${updatedVendor.balance}`)

        const updatedUser = {
          ...user,
          balance: updatedVendor.balance,
          lastActive: new Date().toISOString(),
        }

        setUser(updatedUser)
        console.log("✅ User context updated with new balance:", updatedUser.balance)
      }

      // Send notifications
      await notificationService.notifyPurchaseCompleted(user.id, item.sellerId, {
        name: item.name,
        totalAmount: totalCost,
      })

      console.log("🔔 Purchase notifications sent")

      setPurchaseStatus({ ...purchaseStatus, [item.id]: "success" })

      // Refresh marketplace
      await loadMarketplaceItems()

      // Auto-hide success status with longer delay for better UX
      setTimeout(() => {
        setPurchaseStatus({ ...purchaseStatus, [item.id]: "idle" })
      }, 4000)
    } catch (error) {
      console.error("❌ Purchase failed:", error)
      setPurchaseStatus({ ...purchaseStatus, [item.id]: "error" })
      alert(error instanceof Error ? error.message : "Purchase failed. Please try again.")

      setTimeout(() => {
        setPurchaseStatus({ ...purchaseStatus, [item.id]: "idle" })
      }, 3000)
    }
  }

  const categories = [
    "All",
    "Vegetables",
    "Fruits",
    "Spices",
    "Grains",
    "Pulses",
    "Oil & Ghee",
    "Dairy",
    "Herbs",
    "Dry Fruits",
    "Other",
  ]

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading marketplace...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Live Marketplace</h2>
        <p className="text-xl text-gray-600">Fresh produce directly from sellers to vendors</p>
        <div className="mt-4 flex justify-center space-x-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              📦 <strong>{items.length}</strong> items available
            </p>
          </div>
          {user && (
            <div className="bg-blue-50 p-3 rounded-lg animate-pulse">
              <p className="text-sm text-blue-800">
                👤 <strong>{user.name}</strong> ({user.type})
                {user.type === "vendor" && (
                  <span className="ml-2 font-bold text-green-600">
                    💰 Balance: ₹{user.balance?.toLocaleString() || 0}
                  </span>
                )}
              </p>
            </div>
          )}
          <Button
            onClick={loadMarketplaceItems}
            variant="outline"
            size="sm"
            className="bg-orange-50 hover:bg-orange-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items, sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md glass"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Min ₹"
                value={priceRange.min || ""}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })}
                className="glass"
              />
              <Input
                type="number"
                placeholder="Max ₹"
                value={priceRange.max || ""}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 1000 })}
                className="glass"
              />
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <Badge className="bg-blue-100 text-blue-800">
                <Filter className="w-3 h-3 mr-1" />
                {filteredItems.length} results
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Items Found</h3>
            <p className="text-gray-600">Try adjusting your search filters or check back later for new listings.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`glass-card hover-glow transition-all duration-300 transform hover:scale-105 ${
                purchaseStatus[item.id] === "purchasing" ? "animate-pulse ring-2 ring-orange-400" : ""
              } ${purchaseStatus[item.id] === "success" ? "ring-2 ring-green-400 animate-bounce" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
                    {item.name}
                    {purchaseStatus[item.id] === "purchasing" && (
                      <Zap className="w-4 h-4 ml-2 text-orange-500 animate-spin" />
                    )}
                    {purchaseStatus[item.id] === "success" && (
                      <CheckCircle className="w-4 h-4 ml-2 text-green-500 animate-pulse" />
                    )}
                  </CardTitle>
                  <div className="flex space-x-1">
                    {item.organic && <Badge className="bg-green-100 text-green-800 text-xs">🌱 Organic</Badge>}
                    <Badge className="bg-blue-100 text-blue-800 text-xs">{item.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{item.sellerLocation}</span>
                  <Clock className="w-3 h-3 ml-2" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600 animate-pulse">
                    ₹{item.price}
                    <span className="text-sm text-gray-500">/{item.unit}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="font-bold">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>

                {/* Quality and Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quality:</span>
                    <Badge className="bg-purple-100 text-purple-800">{item.quality}</Badge>
                  </div>
                  {item.description && <p className="text-sm text-gray-600 italic">"{item.description}"</p>}
                  {item.harvestDate && (
                    <p className="text-xs text-gray-500">
                      Harvested: {new Date(item.harvestDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Seller Info */}
                <div className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{item.sellerName}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>{item.sellerRating}/5</span>
                        <Phone className="w-3 h-3 ml-2" />
                        <span>{item.sellerPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {item.views} views
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {item.inquiries} inquiries
                  </span>
                </div>

                {/* Enhanced Purchase Button */}
                <div className="space-y-2">
                  {user?.type === "vendor" && user.id !== item.sellerId ? (
                    <Button
                      onClick={() => handlePurchase(item, 1)}
                      disabled={purchaseStatus[item.id] === "purchasing"}
                      className={`w-full transition-all duration-300 transform hover:scale-105 ${
                        purchaseStatus[item.id] === "purchasing"
                          ? "bg-orange-500 animate-pulse"
                          : purchaseStatus[item.id] === "success"
                            ? "bg-green-500 animate-bounce"
                            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      } hover-glow`}
                    >
                      {purchaseStatus[item.id] === "purchasing" ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-spin" />
                          Processing Purchase...
                          <Heart className="w-4 h-4 ml-2 animate-pulse text-red-200" />
                        </>
                      ) : purchaseStatus[item.id] === "success" ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
                          Purchase Successful!
                          <TrendingUp className="w-4 h-4 ml-2 animate-bounce" />
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now - ₹{item.price}
                          <Zap className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : user?.type === "seller" && user.id === item.sellerId ? (
                    <Button disabled className="w-full bg-gray-300 text-gray-500">
                      <Package className="w-4 h-4 mr-2" />
                      Your Item
                    </Button>
                  ) : user?.type === "seller" ? (
                    <Button disabled className="w-full bg-gray-300 text-gray-500">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Sellers Cannot Purchase
                    </Button>
                  ) : (
                    <Button disabled className="w-full bg-gray-300 text-gray-500">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Login as Vendor to Purchase
                    </Button>
                  )}

                  {/* Enhanced Purchase Status */}
                  {purchaseStatus[item.id] === "success" && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 animate-pulse">
                      <CheckCircle className="w-5 h-5 animate-bounce" />
                      <div>
                        <p className="font-semibold">Purchase Successful! 🎉</p>
                        <p className="text-sm">Check your inventory. Balance updated!</p>
                      </div>
                    </div>
                  )}

                  {purchaseStatus[item.id] === "error" && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Purchase Failed</p>
                        <p className="text-sm">Please try again or check your balance.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
