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
import {
  Truck,
  Package,
  Users,
  TrendingUp,
  Phone,
  CheckCircle,
  AlertCircle,
  Plus,
  Send,
  IndianRupee,
} from "lucide-react"

interface BulkOffer {
  id: string
  itemName: string
  category: string
  minQuantity: number
  maxQuantity: number
  pricePerUnit: number
  unit: string
  quality: string
  description: string
  validUntil: string
  location: string
  available: boolean
}

interface PurchaseRequest {
  id: string
  buyerName: string
  buyerPhone: string
  itemName: string
  quantity: number
  totalAmount: number
  status: "pending" | "accepted" | "rejected" | "completed"
  createdAt: string
  notes?: string
}

export default function SupplierDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("offers")
  const [bulkOffers, setBulkOffers] = useState<BulkOffer[]>([])
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New bulk offer form
  const [newOffer, setNewOffer] = useState({
    itemName: "",
    category: "Vegetables",
    minQuantity: 0,
    maxQuantity: 0,
    pricePerUnit: 0,
    unit: "kg",
    quality: "Standard",
    description: "",
    validUntil: "",
    location: user?.location?.address || "Delhi",
  })

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
  const units = ["kg", "L", "pieces", "bunches", "packets", "tons"]

  // Load supplier data
  useEffect(() => {
    if (user?.type === "supplier") {
      loadSupplierData()
    }
  }, [user])

  const loadSupplierData = async () => {
    try {
      // Load bulk offers from database
      const offers = await database.getItems({ sellerId: user?.id, category: "bulk_offer" })
      setBulkOffers(
        offers.map((item) => ({
          id: item.id,
          itemName: item.name,
          category: item.category,
          minQuantity: item.minQuantity || 50,
          maxQuantity: item.quantity,
          pricePerUnit: item.price,
          unit: item.unit,
          quality: item.quality,
          description: item.description,
          validUntil: item.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: item.sellerLocation,
          available: item.available,
        })),
      )

      // Load purchase requests
      const requests = await database.getTransactions({ sellerId: user?.id })
      setPurchaseRequests(
        requests.map((req) => ({
          id: req.id,
          buyerName: req.buyerName || "Unknown Buyer",
          buyerPhone: req.buyerPhone || "+91 98765 43210",
          itemName: req.itemName,
          quantity: req.quantity,
          totalAmount: req.totalAmount,
          status: req.status,
          createdAt: req.createdAt,
          notes: req.notes,
        })),
      )

      console.log("✅ Supplier data loaded:", { offers: offers.length, requests: requests.length })
    } catch (error) {
      console.error("❌ Error loading supplier data:", error)
    }
  }

  const handleCreateBulkOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.type !== "supplier") return

    setIsSubmitting(true)
    try {
      const offerData = {
        name: newOffer.itemName,
        category: "bulk_offer",
        price: newOffer.pricePerUnit,
        quantity: newOffer.maxQuantity,
        minQuantity: newOffer.minQuantity,
        unit: newOffer.unit,
        quality: newOffer.quality,
        description: newOffer.description,
        validUntil: newOffer.validUntil,
        sellerId: user.id,
        sellerName: user.name,
        sellerRating: user.rating || 4.5,
        sellerPhone: user.phone,
        sellerLocation: newOffer.location,
        tags: ["bulk", "supplier", newOffer.category],
        available: true,
      }

      const offerId = await database.createItem(offerData)
      console.log("✅ Bulk offer created:", offerId)

      // Emit notification
      realtimeService.emit("new_bulk_offer", {
        type: "new_bulk_offer",
        supplierName: user.name,
        itemName: newOffer.itemName,
        minQuantity: newOffer.minQuantity,
        pricePerUnit: newOffer.pricePerUnit,
        unit: newOffer.unit,
      })

      // Reset form
      setNewOffer({
        itemName: "",
        category: "Vegetables",
        minQuantity: 0,
        maxQuantity: 0,
        pricePerUnit: 0,
        unit: "kg",
        quality: "Standard",
        description: "",
        validUntil: "",
        location: user?.location?.address || "Delhi",
      })

      await loadSupplierData()
      alert("Bulk offer created successfully!")
    } catch (error) {
      console.error("❌ Error creating bulk offer:", error)
      alert("Failed to create bulk offer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestResponse = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      await database.updateTransaction(requestId, { status })

      // Send notification to buyer
      realtimeService.emit("purchase_response", {
        type: "purchase_response",
        requestId,
        status,
        supplierName: user?.name,
      })

      await loadSupplierData()
      console.log(`✅ Request ${status}:`, requestId)
    } catch (error) {
      console.error("❌ Error updating request:", error)
    }
  }

  if (!user || user.type !== "supplier") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Supplier Access Required</h3>
          <p className="text-gray-600 mb-4">Please login as a supplier to access bulk supply features.</p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current User:</strong> {user?.name || "Not logged in"} ({user?.type || "No type"})
            </p>
            <p className="text-sm text-blue-600 mt-1">
              You need to be logged in as a "supplier" to access this dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Supplier Dashboard</h2>
        <p className="text-gray-600">Manage bulk offers and vendor requests</p>
        <div className="mt-4 bg-purple-50 p-3 rounded-lg inline-block">
          <p className="text-sm text-purple-800">
            ✅ <strong>Logged in as:</strong> {user.name} (Supplier) • IndexedDB Connected
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <Button
          variant={activeTab === "offers" ? "default" : "ghost"}
          onClick={() => setActiveTab("offers")}
          className="flex items-center space-x-2"
        >
          <Package className="w-4 h-4" />
          <span>Bulk Offers</span>
          <Badge className="ml-2">{bulkOffers.length}</Badge>
        </Button>
        <Button
          variant={activeTab === "requests" ? "default" : "ghost"}
          onClick={() => setActiveTab("requests")}
          className="flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Purchase Requests</span>
          <Badge className="ml-2">{purchaseRequests.filter((r) => r.status === "pending").length}</Badge>
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "ghost"}
          onClick={() => setActiveTab("analytics")}
          className="flex items-center space-x-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics</span>
        </Button>
      </div>

      {/* Bulk Offers Tab */}
      {activeTab === "offers" && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create New Offer */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Plus className="w-6 h-6 mr-3 text-purple-500" />
                Create Bulk Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBulkOffer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                    <Input
                      value={newOffer.itemName}
                      onChange={(e) => setNewOffer({ ...newOffer, itemName: e.target.value })}
                      placeholder="e.g., Bulk Onions"
                      required
                      className="glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={newOffer.category}
                      onChange={(e) => setNewOffer({ ...newOffer, category: e.target.value })}
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
                        value={newOffer.pricePerUnit}
                        onChange={(e) => setNewOffer({ ...newOffer, pricePerUnit: Number(e.target.value) })}
                        placeholder="20"
                        min="1"
                        required
                        className="glass pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Qty *</label>
                    <Input
                      type="number"
                      value={newOffer.minQuantity}
                      onChange={(e) => setNewOffer({ ...newOffer, minQuantity: Number(e.target.value) })}
                      placeholder="50"
                      min="1"
                      required
                      className="glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Qty *</label>
                    <Input
                      type="number"
                      value={newOffer.maxQuantity}
                      onChange={(e) => setNewOffer({ ...newOffer, maxQuantity: Number(e.target.value) })}
                      placeholder="500"
                      min="1"
                      required
                      className="glass"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                    <select
                      value={newOffer.unit}
                      onChange={(e) => setNewOffer({ ...newOffer, unit: e.target.value })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quality *</label>
                    <select
                      value={newOffer.quality}
                      onChange={(e) => setNewOffer({ ...newOffer, quality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md glass"
                      required
                    >
                      {qualities.map((quality) => (
                        <option key={quality} value={quality}>
                          {quality}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until *</label>
                  <Input
                    type="date"
                    value={newOffer.validUntil}
                    onChange={(e) => setNewOffer({ ...newOffer, validUntil: e.target.value })}
                    required
                    className="glass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                    placeholder="Describe your bulk offer, terms, delivery options..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md glass resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 hover-glow"
                >
                  {isSubmitting ? (
                    <>
                      <Package className="w-4 h-4 mr-2 animate-spin" />
                      Creating Offer...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Bulk Offer
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Offers */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center">
                  <Package className="w-6 h-6 mr-3 text-blue-500" />
                  Active Bulk Offers
                </span>
                <Badge className="bg-blue-100 text-blue-800">{bulkOffers.length} Offers</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bulkOffers.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No bulk offers yet</p>
                    <p className="text-sm text-gray-400">Create your first bulk offer!</p>
                  </div>
                ) : (
                  bulkOffers.map((offer) => (
                    <div key={offer.id} className="glass rounded-lg p-4 hover-glow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800">{offer.itemName}</h4>
                        <Badge
                          className={`${offer.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {offer.available ? "Active" : "Expired"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold ml-2 text-purple-600">
                            ₹{offer.pricePerUnit}/{offer.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-semibold ml-2">
                            {offer.minQuantity}-{offer.maxQuantity}
                            {offer.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quality:</span>
                          <span className="font-semibold ml-2">{offer.quality}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Valid Until:</span>
                          <span className="font-semibold ml-2">{new Date(offer.validUntil).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {offer.description && <p className="text-sm text-gray-600 mb-3 italic">"{offer.description}"</p>}

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Badge className="bg-purple-100 text-purple-800 text-xs">Bulk</Badge>
                          <Badge className="bg-gray-100 text-gray-800 text-xs">{offer.category}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs text-red-600 bg-transparent">
                            Deactivate
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
      )}

      {/* Purchase Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {purchaseRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Purchase Requests</h3>
                <p className="text-gray-600">Vendors haven't sent any purchase requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {purchaseRequests.map((request) => (
                <Card key={request.id} className="glass-card hover-lift">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-500" />
                        Purchase Request
                      </CardTitle>
                      <Badge
                        className={`${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : request.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      From: <span className="font-medium text-blue-600">{request.buyerName}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="glass rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Item:</span>
                          <span className="font-semibold ml-2">{request.itemName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-semibold ml-2">{request.quantity}kg</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-semibold ml-2 text-green-600">₹{request.totalAmount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold ml-2">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{request.buyerPhone}</span>
                    </div>

                    {request.notes && (
                      <div className="glass rounded-lg p-3 bg-blue-50/50">
                        <p className="text-sm text-gray-700 italic">"{request.notes}"</p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 hover-glow"
                          onClick={() => handleRequestResponse(request.id, "accepted")}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Request
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleRequestResponse(request.id, "rejected")}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {request.status !== "pending" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="hover-lift bg-transparent">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="hover-lift bg-transparent">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="w-5 h-5 mr-2 text-purple-500" />
                Total Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-black text-purple-600">{bulkOffers.length}</p>
                <p className="text-sm text-gray-600">Active bulk offers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Purchase Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-black text-blue-600">{purchaseRequests.length}</p>
                <p className="text-sm text-gray-600">Total requests received</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-black text-green-600">
                  {purchaseRequests.length > 0
                    ? Math.round(
                        (purchaseRequests.filter((r) => r.status === "accepted").length / purchaseRequests.length) *
                          100,
                      )
                    : 0}
                  %
                </p>
                <p className="text-sm text-gray-600">Acceptance rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
