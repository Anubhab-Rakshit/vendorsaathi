"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/database"
import { useAuth } from "@/lib/auth"
import {
  Package,
  TrendingUp,
  IndianRupee,
  Eye,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

interface SellerInventoryItem {
  id: string
  itemId: string
  itemName: string
  quantity: number
  pricePerUnit: number
  totalValue: number
  status: "listed" | "sold" | "expired"
  listedAt: string
  views?: number
  inquiries?: number
}

export default function SellerInventory() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState<SellerInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalListings, setTotalListings] = useState(0)

  useEffect(() => {
    if (user && (user.type === "seller" || user.type === "supplier")) {
      loadSellerInventory()
    }
  }, [user])

  const loadSellerInventory = async () => {
    try {
      setLoading(true)
      console.log(`🛒 Loading seller inventory for user: ${user?.id}`)

      const inventoryData = await database.getSellerInventory(user!.id)
      console.log(`📦 Raw seller inventory data:`, inventoryData)

      setInventory(inventoryData)

      // Calculate totals
      const earnings = inventoryData
        .filter((item) => item.status === "sold")
        .reduce((sum, item) => sum + item.totalValue, 0)

      setTotalEarnings(earnings)
      setTotalListings(inventoryData.length)

      console.log(`✅ Processed ${inventoryData.length} seller inventory items, earnings: ₹${earnings}`)
    } catch (error) {
      console.error("❌ Error loading seller inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "listed":
        return "bg-blue-100 text-blue-800"
      case "sold":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "listed":
        return <Clock className="w-4 h-4" />
      case "sold":
        return <CheckCircle className="w-4 h-4" />
      case "expired":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  if (!user || (user.type !== "seller" && user.type !== "supplier")) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Seller inventory is only available for seller and supplier accounts.</p>
        <div className="mt-4 bg-blue-50 p-4 rounded-lg inline-block">
          <p className="text-sm text-blue-800">
            <strong>Current User:</strong> {user?.name || "Not logged in"} ({user?.type || "No type"})
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your inventory...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          {user.type === "supplier" ? "Supplier" : "Seller"} Inventory
        </h2>
        <p className="text-xl text-gray-600">Track your listed items and sales performance</p>
        <div className="mt-4 flex justify-center space-x-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ <strong>Logged in as:</strong> {user.name} ({user.type})
            </p>
          </div>
          <Button onClick={loadSellerInventory} variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</p>
              </div>
              <IndianRupee className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-blue-600">{totalListings}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-purple-600">
                  {inventory.filter((item) => item.status === "listed").length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-orange-600">
                  {inventory.filter((item) => item.status === "sold").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <Card className="glass-card bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Found {inventory.length} inventory items for seller {user.id}
          </p>
          {inventory.length === 0 && (
            <p className="text-sm text-blue-600 mt-2">
              💡 To get inventory items, list some items in the marketplace first!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Inventory Items */}
      {inventory.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Items Listed</h3>
            <p className="text-gray-600 mb-4">You haven't listed any items yet.</p>
            <p className="text-sm text-gray-500 mb-4">Use the "List Items" feature to add items to your inventory.</p>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              List New Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => (
            <Card key={item.id} className="glass-card hover-glow transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800">{item.itemName}</CardTitle>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusIcon(item.status)}
                    <span className="ml-1 capitalize">{item.status}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Listed on {new Date(item.listedAt).toLocaleDateString()}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="glass rounded-lg p-3">
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-bold text-lg">{item.quantity}</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <p className="text-gray-600">Price/Unit</p>
                    <p className="font-bold text-lg">₹{item.pricePerUnit}</p>
                  </div>
                </div>

                {/* Total Value */}
                <div className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-bold text-xl text-green-600">₹{item.totalValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {item.views || 0} views
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {item.inquiries || 0} inquiries
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {item.status === "listed" && (
                    <>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Edit Item
                      </Button>
                      <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                        Remove
                      </Button>
                    </>
                  )}
                  {item.status === "sold" && (
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      View Transaction
                    </Button>
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
