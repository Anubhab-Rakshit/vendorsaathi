"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Users, TrendingUp, Bell, Menu, X, MapPin, Wallet } from "lucide-react"

export default function MarketNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-orange-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Indian flair */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                VendorSaathi
              </h1>
              <p className="text-xs text-orange-600 font-medium">आपका व्यापारिक साथी</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50">
              <Users className="w-4 h-4 mr-2" />
              समूह खरीदारी
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50">
              <TrendingUp className="w-4 h-4 mr-2" />
              मूल्य ट्रैकर
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50">
              <MapPin className="w-4 h-4 mr-2" />
              स्थानीय शेयरिंग
            </Button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-orange-600">
                <Bell className="w-5 h-5" />
              </Button>
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                3
              </Badge>
            </div>

            {/* Wallet Balance */}
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">₹2,450</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-orange-200">
            <div className="flex flex-col space-y-3">
              <Button variant="ghost" className="justify-start text-gray-700 hover:text-orange-600">
                <Users className="w-4 h-4 mr-2" />
                समूह खरीदारी
              </Button>
              <Button variant="ghost" className="justify-start text-gray-700 hover:text-orange-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                मूल्य ट्रैकर
              </Button>
              <Button variant="ghost" className="justify-start text-gray-700 hover:text-orange-600">
                <MapPin className="w-4 h-4 mr-2" />
                स्थानीय शेयरिंग
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
