"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, MapPin, ShoppingCart, CheckCircle, Zap, Phone, MessageCircle } from "lucide-react"

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("predictions")
  const [groupOrders, setGroupOrders] = useState([
    {
      id: 1,
      item: "प्याज",
      quantity: "50kg",
      currentMembers: 8,
      targetMembers: 12,
      savings: "₹240",
      timeLeft: "2h 30m",
      status: "active",
    },
    {
      id: 2,
      item: "आलू",
      quantity: "75kg",
      currentMembers: 15,
      targetMembers: 15,
      savings: "₹450",
      timeLeft: "Ready!",
      status: "ready",
    },
  ])

  const [localShares, setLocalShares] = useState([
    {
      id: 1,
      vendor: "सुनीता दीदी",
      item: "टमाटर",
      quantity: "8kg",
      price: "₹25/kg",
      distance: "50m",
      rating: 4.8,
      available: true,
    },
    {
      id: 2,
      vendor: "राम भाई",
      item: "हरी मिर्च",
      quantity: "3kg",
      price: "₹80/kg",
      distance: "120m",
      rating: 4.9,
      available: true,
    },
  ])

  const [priceAlerts, setPriceAlerts] = useState([
    {
      item: "आलू",
      currentPrice: "₹30/kg",
      predictedPrice: "₹25/kg",
      change: -5,
      recommendation: "Wait",
      confidence: 85,
    },
    {
      item: "प्याज",
      currentPrice: "₹40/kg",
      predictedPrice: "₹45/kg",
      change: 5,
      recommendation: "Buy Now",
      confidence: 92,
    },
  ])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">आपका Smart Dashboard</h2>
        <p className="text-gray-600">AI-powered insights और real-time opportunities</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl p-2 shadow-sm">
        {[
          { id: "predictions", label: "🤖 AI Predictions", icon: Zap },
          { id: "groups", label: "👥 Group Orders", icon: Users },
          { id: "sharing", label: "📍 Local Sharing", icon: MapPin },
          { id: "prices", label: "💰 Price Intelligence", icon: TrendingUp },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            {React.createElement(tab.icon, { className: "w-4 h-4 mr-2" })}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* AI Predictions Tab */}
      {activeTab === "predictions" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="vendor-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="w-5 h-5 mr-2 text-orange-500" />
                Tomorrow's Demand Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { item: "प्याज", predicted: "15kg", confidence: 94, trend: "up" },
                { item: "टमाटर", predicted: "12kg", confidence: 87, trend: "stable" },
                { item: "आलू", predicted: "20kg", confidence: 91, trend: "down" },
              ].map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{prediction.item}</p>
                    <p className="text-sm text-gray-600">Predicted: {prediction.predicted}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={prediction.confidence > 90 ? "default" : "secondary"}>
                      {prediction.confidence}% sure
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {prediction.trend === "up" ? "📈" : prediction.trend === "down" ? "📉" : "➡️"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="vendor-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">💡 Best Action</h4>
                <p className="text-sm text-green-700">
                  राम जी के साथ प्याज का group order करें। आप <span className="font-semibold">₹120 बचा सकते हैं</span>!
                </p>
                <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                  Join Group Order
                </Button>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">⏰ Timing Alert</h4>
                <p className="text-sm text-blue-700">
                  आलू की कीमत कल सुबह 10 बजे तक <span className="font-semibold">₹5/kg कम</span> होगी।
                </p>
                <Button size="sm" variant="outline" className="mt-3 border-blue-300 text-blue-700 bg-transparent">
                  Set Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Group Orders Tab */}
      {activeTab === "groups" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {groupOrders.map((order) => (
            <Card key={order.id} className="vendor-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
                    {order.item} Group Order
                  </CardTitle>
                  <Badge variant={order.status === "ready" ? "default" : "secondary"}>
                    {order.status === "ready" ? "Ready!" : "Active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-semibold text-lg">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Your Savings</p>
                    <p className="font-semibold text-lg text-green-600">{order.savings}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      Members: {order.currentMembers}/{order.targetMembers}
                    </span>
                    <span className="text-orange-600">{order.timeLeft}</span>
                  </div>
                  <Progress value={(order.currentMembers / order.targetMembers) * 100} className="h-2" />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" variant={order.status === "ready" ? "default" : "outline"}>
                    {order.status === "ready" ? "Place Order" : "Join Group"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="vendor-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Create New Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">अपना group order शुरू करें और पड़ोसी vendors को invite करें</p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                + New Group Order
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Local Sharing Tab */}
      {activeTab === "sharing" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {localShares.map((share) => (
            <Card key={share.id} className="vendor-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{share.vendor}</CardTitle>
                  <Badge className="bg-green-100 text-green-800">⭐ {share.rating}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-xl text-gray-800">{share.item}</h4>
                  <p className="text-gray-600">{share.quantity} available</p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{share.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {share.distance}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="vendor-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                Share Your Excess
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Extra inventory है? अपने पड़ोसी vendors के साथ share करें</p>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                + Share Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Intelligence Tab */}
      {activeTab === "prices" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {priceAlerts.map((alert, index) => (
            <Card key={index} className="vendor-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                    {alert.item} Price Intelligence
                  </span>
                  <Badge variant={alert.recommendation === "Buy Now" ? "default" : "secondary"}>
                    {alert.confidence}% confident
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Current Price</p>
                    <p className="text-2xl font-bold text-gray-800">{alert.currentPrice}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Predicted Price</p>
                    <p className="text-2xl font-bold text-blue-800">{alert.predictedPrice}</p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    alert.recommendation === "Buy Now"
                      ? "bg-green-50 border border-green-200"
                      : "bg-orange-50 border border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`font-medium ${
                          alert.recommendation === "Buy Now" ? "text-green-800" : "text-orange-800"
                        }`}
                      >
                        {alert.recommendation === "Buy Now" ? "✅ Buy Now" : "⏳ Wait"}
                      </h4>
                      <p
                        className={`text-sm ${
                          alert.recommendation === "Buy Now" ? "text-green-700" : "text-orange-700"
                        }`}
                      >
                        {alert.change > 0
                          ? `Price may increase by ₹${alert.change}/kg`
                          : `Price may decrease by ₹${Math.abs(alert.change)}/kg`}
                      </p>
                    </div>
                    <div className="text-2xl">{alert.change > 0 ? "📈" : "📉"}</div>
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    alert.recommendation === "Buy Now"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {alert.recommendation === "Buy Now" ? "Find Suppliers" : "Set Price Alert"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
