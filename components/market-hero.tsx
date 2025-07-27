"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Zap, ArrowRight, ShoppingCart, Star } from "lucide-react"

export default function MarketHero() {
  const [currentStat, setCurrentStat] = useState(0)

  const stats = [
    { label: "सक्रिय विक्रेता", value: "2,847", icon: Users },
    { label: "दैनिक बचत", value: "₹45,000", icon: TrendingUp },
    { label: "समूह ऑर्डर", value: "156", icon: ShoppingCart },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 market-pattern">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-yellow-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Smart Sourcing
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-800 bg-clip-text text-transparent">
                  स्ट्रीट फूड
                </span>
                <br />
                <span className="text-gray-800">Revolution</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                AI के साथ अपने व्यापार को बढ़ाएं। समूह में खरीदारी करें, बेहतर दाम पाएं, और अपने पड़ोसी विक्रेताओं के साथ inventory share
                करें।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg indian-shadow"
              >
                अभी शुरू करें
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-8 py-4 text-lg bg-transparent"
              >
                Demo देखें
              </Button>
            </div>

            {/* Live Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 vendor-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Live Stats</p>
                  <div className="flex items-center space-x-3">
                    {React.createElement(stats[currentStat].icon, {
                      className: "w-6 h-6 text-orange-600",
                    })}
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats[currentStat].value}</p>
                      <p className="text-sm text-gray-600">{stats[currentStat].label}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {stats.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStat ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Interactive Dashboard Preview */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 vendor-card">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">आज का Dashboard</h3>
                  <Badge className="bg-green-100 text-green-800">
                    <Star className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>

                {/* AI Predictions */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-800 mb-2">🤖 AI Prediction</h4>
                    <p className="text-sm text-gray-600">
                      कल आपको <span className="font-semibold text-blue-600">प्याज 15kg</span> की जरूरत होगी।
                      <span className="font-semibold text-green-600">राम जी</span> के साथ group order करें और
                      <span className="font-semibold text-orange-600">₹120 बचाएं</span>!
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-800 mb-2">📍 Local Share</h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-green-600">सुनीता दीदी</span> के पास extra{" "}
                      <span className="font-semibold">टमाटर 8kg</span> है।
                      <span className="font-semibold text-blue-600">50m दूर</span> - अभी contact करें!
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-800 mb-2">💰 Price Alert</h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-red-600">आलू की कीमत</span> कल
                      <span className="font-semibold text-green-600">₹5/kg कम</span> होगी। Order को postpone करें!
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 text-sm bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    Group Order
                  </Button>
                  <Button variant="outline" className="h-12 text-sm bg-transparent">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Price Check
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🛒</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">🤝</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
