"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/database"
import { realtimeService } from "@/lib/realtime-service"
import { useAuth } from "@/lib/auth"
import { Package, Plus, Upload, Scale, Tag, Clock, CheckCircle, AlertCircle, IndianRupee } from "lucide-react"
import { notificationService } from "@/lib/notification-service"

interface ItemFormData {
  name: string
  category: string
  price: number
  quantity: number
  unit: string
  quality: string
  description: string
  harvestDate?: string
  organic: boolean
}

export default function SellerItemForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    category: "Vegetables",
    price: 0,
    quantity: 0,
    unit: "kg",
    quality: "Standard",
    description: "",
    harvestDate: "",
    organic: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [myItems, setMyItems] = useState<any[]>([])

  // Load seller's items on mount
  useEffect(() => {
    if (user?.type === "seller") {
      loadMyItems()
    }
  }, [user])

  const loadMyItems = async () => {
    try {
      const items = await database.getItems({ sellerId: user?.id })
      setMyItems(items)
      console.log("✅ Loaded seller items:", items)
    } catch (error) {
      console.error("❌ Error loading items:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is actually a seller
    if (!user || user.type !== "seller") {
      setErrorMessage("Only sellers can list items!")
      setSubmitStatus("error")
      return
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setErrorMessage("Item name is required")
      setSubmitStatus("error")
      return
    }

    if (formData.price <= 0) {
      setErrorMessage("Please enter a valid price greater than 0")
      setSubmitStatus("error")
      return
    }

    if (formData.quantity <= 0) {
      setErrorMessage("Please enter a valid quantity greater than 0")
      setSubmitStatus("error")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      console.log("🚀 Starting item submission process...")
      console.log("📝 Form data:", formData)
      console.log("👤 User data:", user)

      const itemData = {
        ...formData,
        sellerId: user.id,
        sellerName: user.name,
        sellerRating: user.rating || 4.5,
        sellerPhone: user.phone,
        sellerLocation: user.location?.address || "Delhi",
        category: formData.category,
        tags: [formData.category, formData.quality, formData.organic ? "Organic" : "Regular"],
        images: [], // TODO: Add image upload
        location: user.location,
        verified: user.verified || false,
      }

      console.log("💾 Prepared item data for database:", itemData)

      // Save to IndexedDB
      const itemId = await database.createItem(itemData)

      console.log("✅ Item saved to IndexedDB successfully:", itemId)

      // Emit real-time notification to all users
      realtimeService.emit("new_item_listed", {
        type: "new_item_listed",
        itemId: itemId,
        itemName: formData.name,
        sellerName: user.name,
        price: formData.price,
        category: formData.category,
        timestamp: new Date().toISOString(),
      })

      console.log("📡 Real-time notification emitted")

      // Send role-based notification to vendors
      await notificationService.notifyItemListed(user.id, {
        name: formData.name,
        price: formData.price,
        unit: formData.unit,
        category: formData.category,
      })

      console.log("🔔 Role-based notifications sent")

      // Reset form
      setFormData({
        name: "",
        category: "Vegetables",
        price: 0,
        quantity: 0,
        unit: "kg",
        quality: "Standard",
        description: "",
        harvestDate: "",
        organic: false,
      })

      setSubmitStatus("success")
      await loadMyItems() // Refresh items list

      // Auto-hide success message
      setTimeout(() => setSubmitStatus("idle"), 5000)
    } catch (error) {
      console.error("❌ Error listing item:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to save item to database")
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
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

  const qualities = ["Premium", "Standard", "Basic"]
  const units = ["kg", "L", "pieces", "bunches", "packets"]

  // Check if user is seller - FIXED the condition
  if (!user || user.type !== "seller") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Seller Access Required</h3>
          <p className="text-gray-600 mb-4">Please login as a seller to list items in the marketplace.</p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current User:</strong> {user?.name || "Not logged in"} ({user?.type || "No type"})
            </p>
            <p className="text-sm text-blue-600 mt-1">You need to be logged in as a "seller" to access this feature.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">List Your Items</h2>
        <p className="text-gray-600">Add items to the VendorSaathi marketplace and connect with vendors</p>
        <div className="mt-4 bg-green-50 p-3 rounded-lg inline-block">
          <p className="text-sm text-green-800">
            ✅ <strong>Logged in as:</strong> {user.name} (Seller) • Database Ready
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Item Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Plus className="w-6 h-6 mr-3 text-green-500" />
              Add New Item to Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Fresh Red Onions"
                    required
                    className="glass"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md glass"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Quantity - FIXED INR FORMAT */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IndianRupee className="w-4 h-4 inline mr-1" />
                    Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                      placeholder="25"
                      min="1"
                      step="0.01"
                      required
                      className="glass pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Price per unit in Indian Rupees</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Scale className="w-4 h-4 inline mr-1" />
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 0 })}
                    placeholder="Available qty"
                    min="1"
                    required
                    className="glass"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md glass"
                    required
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quality & Features */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Quality Grade
                  </label>
                  <select
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md glass"
                  >
                    {qualities.map((quality) => (
                      <option key={quality} value={quality}>
                        {quality}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Harvest Date
                  </label>
                  <Input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="glass"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your item quality, freshness, special features..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md glass resize-none"
                />
              </div>

              {/* Organic Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="organic"
                  checked={formData.organic}
                  onChange={(e) => setFormData({ ...formData, organic: e.target.checked })}
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="organic" className="text-sm font-medium text-gray-700">
                  🌱 Organic Product
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover-glow"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Saving to Database...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    List Item in Marketplace
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    ✅ Item saved successfully! It's now live in the marketplace and vendors have been notified.
                  </span>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Failed to save item to database</p>
                    <p className="text-sm">{errorMessage || "Please try again."}</p>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* My Listed Items */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              <span className="flex items-center">
                <Package className="w-6 h-6 mr-3 text-blue-500" />
                My Listed Items (Database)
              </span>
              <Badge className="bg-blue-100 text-blue-800">{myItems.length} Items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {myItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No items in database yet</p>
                  <p className="text-sm text-gray-400">List your first item to get started!</p>
                </div>
              ) : (
                myItems.map((item) => (
                  <div key={item.id} className="glass rounded-lg p-4 hover-glow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800">{item.name}</h4>
                      <Badge
                        className={`${item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {item.available ? "Available" : "Sold Out"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold ml-2 text-green-600">
                          ₹{item.price}/{item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-semibold ml-2">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quality:</span>
                        <span className="font-semibold ml-2">{item.quality}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Listed:</span>
                        <span className="font-semibold ml-2">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {item.description && <p className="text-sm text-gray-600 mt-2 italic">"{item.description}"</p>}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex space-x-2">
                        {item.organic && <Badge className="bg-green-100 text-green-800 text-xs">🌱 Organic</Badge>}
                        <Badge className="bg-gray-100 text-gray-800 text-xs">{item.category}</Badge>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">📊 In DB</Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 bg-transparent"
                          onClick={async () => {
                            try {
                              await database.updateItem(item.id, { available: false })
                              await loadMyItems()
                              console.log("✅ Item removed from marketplace")
                            } catch (error) {
                              console.error("❌ Failed to remove item:", error)
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
