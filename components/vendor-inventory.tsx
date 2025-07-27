"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { database } from "@/lib/database"
import { useAuth } from "@/lib/auth"
import {
  Package,
  TrendingUp,
  IndianRupee,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Minus,
  Plus,
} from "lucide-react"

interface VendorInventoryItem {
  id: string
  vendorId: string
  itemName: string
  category: string
  quantity: number
  pricePerUnit: number
  totalCost: number
  purchasedAt: string
  currentStock: number
  status: "in_stock" | "out_of_stock" | "low_stock"
}

export default function VendorInventory() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState<VendorInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [stockUpdating, setStockUpdating] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (user && user.type === "vendor") {
      loadVendorInventory()
    }
  }, [user])

  const loadVendorInventory = async () => {
    try {
      setLoading(true)
      console.log(`🏪 Loading vendor inventory for user: ${user?.id}`)

      const inventoryData = await database.getVendorInventory(user!.id)
      console.log(`📦 Raw vendor inventory data:`, inventoryData)

      setInventory(inventoryData)

      // Calculate totals
      const investment = inventoryData.reduce((sum, item) => sum + item.totalCost, 0)
      const items = inventoryData.reduce((sum, item) => sum + item.currentStock, 0)

      setTotalInvestment(investment)
      setTotalItems(items)

      console.log(`✅ Processed ${inventoryData.length} vendor inventory items, investment: ₹${investment}`)
    } catch (error) {
      console.error("❌ Error loading vendor inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (inventoryId: string, newStock: number) => {
    if (newStock < 0) return

    setStockUpdating({ ...stockUpdating, [inventoryId]: true })

    try {
      await database.updateVendorInventoryStock(inventoryId, newStock)
      await loadVendorInventory() // Refresh inventory
      console.log(`✅ Stock updated for inventory item: ${inventoryId}`)
    } catch (error) {
      console.error("❌ Error updating stock:", error)
    } finally {
      setStockUpdating({ ...stockUpdating, [inventoryId]: false })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_stock":
        return <CheckCircle className="w-4 h-4" />
      case "low_stock":
        return <AlertCircle className="w-4 h-4" />
      case "out_of_stock":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  if (!user || user.type !== "vendor") {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Vendor inventory is only available for vendor accounts.</p>
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
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Vendor Inventory</h2>
        <p className="text-xl text-gray-600">Manage your purchased items and stock levels</p>
        <div className="mt-4 flex justify-center space-x-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ <strong>Logged in as:</strong> {user.name} (Vendor) • Balance: ₹{user.balance?.toLocaleString() || 0}
            </p>
          </div>
          <Button onClick={loadVendorInventory} variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100">
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
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold text-blue-600">₹{totalInvestment.toLocaleString()}</p>
              </div>
              <IndianRupee className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-green-600">{totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-purple-600">
                  {inventory.filter((item) => item.status === "in_stock").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(inventory.map((item) => item.category)).size}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <Card className="glass-card bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Found {inventory.length} inventory items for vendor {user.id}
          </p>
          {inventory.length === 0 && (
            <p className="text-sm text-blue-600 mt-2">
              💡 To get inventory items, purchase some items from the marketplace first!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Inventory Items */}
      {inventory.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Items in Inventory</h3>
            <p className="text-gray-600 mb-4">You haven't purchased any items yet.</p>
            <p className="text-sm text-gray-500 mb-4">Visit the marketplace to purchase items from sellers.</p>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Go to Marketplace
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
                    <span className="ml-1 capitalize">{item.status.replace("_", " ")}</span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>Purchased on {new Date(item.purchasedAt).toLocaleDateString()}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Category */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <Badge className="bg-blue-100 text-blue-800">{item.category}</Badge>
                </div>

                {/* Purchase Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="glass rounded-lg p-3">
                    <p className="text-gray-600">Purchased Qty</p>
                    <p className="font-bold text-lg">{item.quantity}</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <p className="text-gray-600">Price/Unit</p>
                    <p className="font-bold text-lg">₹{item.pricePerUnit}</p>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Cost</span>
                    <span className="font-bold text-xl text-blue-600">₹{item.totalCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Current Stock Management */}
                <div className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Current Stock</span>
                    <span className="font-bold text-lg">{item.currentStock}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStock(item.id, item.currentStock - 1)}
                      disabled={item.currentStock <= 0 || stockUpdating[item.id]}
                      className="bg-red-50 hover:bg-red-100"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    <Input
                      type="number"
                      value={item.currentStock}
                      onChange={(e) => {
                        const newStock = Number(e.target.value)
                        if (newStock >= 0) {
                          updateStock(item.id, newStock)
                        }
                      }}
                      className="text-center w-20 h-8"
                      min="0"
                    />

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStock(item.id, item.currentStock + 1)}
                      disabled={stockUpdating[item.id]}
                      className="bg-green-50 hover:bg-green-100"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {stockUpdating[item.id] && <p className="text-xs text-blue-600 mt-1">Updating stock...</p>}
                </div>

                {/* Stock Status Indicator */}
                <div className="text-center">
                  {item.currentStock === 0 && <p className="text-red-600 text-sm font-semibold">⚠️ Out of Stock</p>}
                  {item.currentStock > 0 && item.currentStock <= 5 && (
                    <p className="text-yellow-600 text-sm font-semibold">⚠️ Low Stock</p>
                  )}
                  {item.currentStock > 5 && <p className="text-green-600 text-sm font-semibold">✅ In Stock</p>}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700">
                    Reorder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
