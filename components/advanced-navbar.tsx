"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Globe,
  Zap,
  Brain,
  TrendingUp,
  Users,
  MapPin,
  MessageCircle,
  Home,
  BarChart3,
  Package,
  Store,
  Truck,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import NotificationSystem from "./notification-system"

export default function AdvancedNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    {
      label: language === "en" ? "Dashboard" : "डैशबोर्ड",
      icon: Home,
      href: "#dashboard",
    },
    {
      label: language === "en" ? "AI Insights" : "AI अंतर्दृष्टि",
      icon: Brain,
      href: "#ai-insights",
    },
    {
      label: language === "en" ? "Group Orders" : "समूह ऑर्डर",
      icon: Users,
      href: "#group-orders",
    },
    {
      label: language === "en" ? "Price Trends" : "मूल्य रुझान",
      icon: TrendingUp,
      href: "#price-trends",
    },
    {
      label: language === "en" ? "Local Network" : "स्थानीय नेटवर्क",
      icon: MapPin,
      href: "#local-network",
    },
    {
      label: language === "en" ? "Analytics" : "विश्लेषण",
      icon: BarChart3,
      href: "#analytics",
    },
  ]

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  // Get user type display info
  const getUserTypeInfo = () => {
    if (!user) return { label: "User", icon: User, color: "bg-gray-500" }

    switch (user.type) {
      case "vendor":
        return {
          label: language === "en" ? "Street Vendor" : "स्ट्रीट विक्रेता",
          icon: User,
          color: "bg-blue-500",
        }
      case "supplier":
        return {
          label: language === "en" ? "Supplier" : "आपूर्तिकर्ता",
          icon: Truck,
          color: "bg-purple-500",
        }
      case "seller":
        return {
          label: language === "en" ? "Marketplace Seller" : "मार्केटप्लेस विक्रेता",
          icon: Store,
          color: "bg-green-500",
        }
      default:
        return { label: "User", icon: User, color: "bg-gray-500" }
    }
  }

  const userTypeInfo = getUserTypeInfo()

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black gradient-text">VendorSaathi</h1>
                <p className="text-xs text-gray-500 -mt-1">
                  {language === "en" ? "AI-Powered Ecosystem" : "AI-संचालित पारिस्थितिकी तंत्र"}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
                  onClick={() => {
                    document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="hidden sm:flex items-center space-x-2 glass hover-glow"
              >
                <Globe className="w-4 h-4" />
                <span className="font-medium">{language === "en" ? "हिं" : "EN"}</span>
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(true)}
                className="relative glass hover-glow"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 glass hover-glow">
                    <div className={`w-8 h-8 ${userTypeInfo.color} rounded-full flex items-center justify-center`}>
                      <userTypeInfo.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-800">
                        {user?.name || (language === "en" ? "User" : "उपयोगकर्ता")}
                      </p>
                      <p className="text-xs text-gray-500">{userTypeInfo.label}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-800">{user?.name || "User"}</p>
                    <p className="text-sm text-gray-500">{user?.email || "user@example.com"}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                      <span className="text-xs text-green-600">{language === "en" ? "AI Connected" : "AI जुड़ा हुआ"}</span>
                    </div>
                  </div>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{language === "en" ? "Profile" : "प्रोफ़ाइल"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>{language === "en" ? "Settings" : "सेटिंग्स"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>{language === "en" ? "My Inventory" : "मेरी इन्वेंटरी"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>{language === "en" ? "Support" : "सहायता"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{language === "en" ? "Logout" : "लॉग आउट"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden glass hover-glow">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 glass">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="gradient-text">VendorSaathi</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-8 space-y-4">
                    {/* User Info */}
                    <div className="glass rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 ${userTypeInfo.color} rounded-full flex items-center justify-center`}
                        >
                          <userTypeInfo.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user?.name || "User"}</p>
                          <p className="text-sm text-gray-500">{userTypeInfo.label}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                            <span className="text-xs text-green-600">
                              {language === "en" ? "AI Connected" : "AI जुड़ा हुआ"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Language Toggle */}
                    <Button
                      variant="ghost"
                      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                      className="w-full justify-start glass hover-glow"
                    >
                      <Globe className="w-4 h-4 mr-3" />
                      {language === "en" ? "Switch to Hindi (हिं)" : "Switch to English"}
                    </Button>

                    {/* Navigation Items */}
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          className="w-full justify-start glass hover-glow"
                          onClick={() => {
                            document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" })
                            setMobileMenuOpen(false)
                          }}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Button>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <Button variant="ghost" className="w-full justify-start glass hover-glow">
                        <Settings className="w-4 h-4 mr-3" />
                        {language === "en" ? "Settings" : "सेटिंग्स"}
                      </Button>
                      <Button variant="ghost" className="w-full justify-start glass hover-glow">
                        <MessageCircle className="w-4 h-4 mr-3" />
                        {language === "en" ? "Support" : "सहायता"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {language === "en" ? "Logout" : "लॉग आउट"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 4).map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-orange-600"
                onClick={() => {
                  document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{item.label.split(" ")[0]}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Notification System */}
      <NotificationSystem
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  )
}
