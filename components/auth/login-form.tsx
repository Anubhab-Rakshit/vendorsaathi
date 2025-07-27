"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff, Zap, Globe, User, Store, Truck } from "lucide-react"

interface LoginFormProps {
  onToggleMode: () => void
  language: "en" | "hi"
  onToggleLanguage: () => void
}

export default function LoginForm({ onToggleMode, language, onToggleLanguage }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"vendor" | "supplier" | "seller">("vendor")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password, userType)
    } catch (error) {
      setError("Invalid credentials. Please check your email, password, and user type.")
    }
  }

  const demoAccounts = [
    {
      type: "vendor" as const,
      email: "ram.vendor@gmail.com",
      name: "Ram Singh (Vendor)",
      description: language === "en" ? "Street food vendor" : "स्ट्रीट फूड विक्रेता",
      icon: User,
      color: "bg-blue-500",
    },
    {
      type: "supplier" as const,
      email: "sunita.supplier@gmail.com",
      name: "Sunita Devi (Supplier)",
      description: language === "en" ? "Wholesale supplier" : "थोक आपूर्तिकर्ता",
      icon: Truck,
      color: "bg-purple-500",
    },
    {
      type: "seller" as const,
      email: "amit.seller@gmail.com",
      name: "Amit Kumar (Seller)",
      description: language === "en" ? "Marketplace seller" : "मार्केटप्लेस विक्रेता",
      icon: Store,
      color: "bg-green-500",
    },
  ]

  const fillDemoAccount = (account: (typeof demoAccounts)[0]) => {
    setEmail(account.email)
    setPassword("demo123")
    setUserType(account.type)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="flex items-center justify-center lg:justify-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black gradient-text">VendorSaathi</h1>
              <p className="text-gray-600 text-lg">
                {language === "en" ? "AI-Powered Ecosystem" : "AI-संचालित पारिस्थितिकी तंत्र"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">
              {language === "en" ? "Welcome Back!" : "वापस स्वागत है!"}
            </h2>
            <p className="text-xl text-gray-600">
              {language === "en"
                ? "Connect with suppliers, optimize procurement, and grow your street food business with AI."
                : "आपूर्तिकर्ताओं से जुड़ें, खरीदारी को अनुकूलित करें, और AI के साथ अपने स्ट्रीट फूड व्यवसाय को बढ़ाएं।"}
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {language === "en" ? "Try Demo Accounts:" : "डेमो खाते आज़माएं:"}
            </h3>
            <div className="grid gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.type}
                  onClick={() => fillDemoAccount(account)}
                  className="flex items-center space-x-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className={`w-10 h-10 ${account.color} rounded-lg flex items-center justify-center`}>
                    <account.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{account.name}</p>
                    <p className="text-sm text-gray-600">{account.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="glass-card shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">
                {language === "en" ? "Sign In" : "साइन इन करें"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onToggleLanguage} className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "हिं" : "EN"}</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {language === "en" ? "I am a:" : "मैं हूँ:"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "vendor", label: language === "en" ? "Vendor" : "विक्रेता", icon: User },
                    { value: "supplier", label: language === "en" ? "Supplier" : "आपूर्तिकर्ता", icon: Truck },
                    { value: "seller", label: language === "en" ? "Seller" : "विक्रेता", icon: Store },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setUserType(type.value as any)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        userType === type.value
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Email Address" : "ईमेल पता"}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === "en" ? "Enter your email" : "अपना ईमेल दर्ज करें"}
                  required
                  className="glass"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Password" : "पासवर्ड"}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === "en" ? "Enter your password" : "अपना पासवर्ड दर्ज करें"}
                    required
                    className="glass pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading
                  ? language === "en"
                    ? "Signing In..."
                    : "साइन इन हो रहा है..."
                  : language === "en"
                    ? "Sign In"
                    : "साइन इन करें"}
              </Button>
            </form>

            {/* Toggle to Register */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                {language === "en" ? "Don't have an account?" : "खाता नहीं है?"}{" "}
                <button
                  onClick={onToggleMode}
                  className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                >
                  {language === "en" ? "Sign Up" : "साइन अप करें"}
                </button>
              </p>
            </div>

            {/* Demo Credentials Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                {language === "en" ? "Demo Credentials:" : "डेमो क्रेडेंशियल:"}
              </p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>📧 Email: Use any demo account above</p>
                <p>🔑 Password: demo123</p>
                <p>👤 Select correct user type</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
