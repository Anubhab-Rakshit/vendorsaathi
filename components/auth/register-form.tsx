"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff, Zap, Globe, User, Store, Truck, MapPin, Phone, Mail, Building } from "lucide-react"

interface RegisterFormProps {
  onToggleMode: () => void
  language: "en" | "hi"
  onToggleLanguage: () => void
}

export default function RegisterForm({ onToggleMode, language, onToggleLanguage }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    address: "",
    password: "",
    confirmPassword: "",
    type: "vendor" as "vendor" | "supplier" | "seller",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const { register, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(language === "en" ? "Passwords do not match" : "पासवर्ड मेल नहीं खाते")
      return
    }

    if (formData.password.length < 6) {
      setError(language === "en" ? "Password must be at least 6 characters" : "पासवर्ड कम से कम 6 अक्षर का होना चाहिए")
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        address: formData.address,
        password: formData.password,
        type: formData.type,
      })
    } catch (error) {
      setError(language === "en" ? "Registration failed. Please try again." : "पंजीकरण असफल। कृपया पुनः प्रयास करें।")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
              {language === "en" ? "Join VendorSaathi!" : "VendorSaathi में शामिल हों!"}
            </h2>
            <p className="text-xl text-gray-600">
              {language === "en"
                ? "Create your account and start optimizing your street food business with AI-powered insights."
                : "अपना खाता बनाएं और AI-संचालित अंतर्दृष्टि के साथ अपने स्ट्रीट फूड व्यवसाय को अनुकूलित करना शुरू करें।"}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {language === "en" ? "Why Choose VendorSaathi?" : "VendorSaathi क्यों चुनें?"}
            </h3>
            <div className="space-y-3">
              {[
                {
                  icon: "🤖",
                  title: language === "en" ? "AI-Powered Insights" : "AI-संचालित अंतर्दृष्टि",
                  desc: language === "en" ? "Smart demand forecasting" : "स्मार्ट मांग पूर्वानुमान",
                },
                {
                  icon: "💰",
                  title: language === "en" ? "Cost Optimization" : "लागत अनुकूलन",
                  desc: language === "en" ? "Group orders & bulk savings" : "समूह ऑर्डर और थोक बचत",
                },
                {
                  icon: "🌐",
                  title: language === "en" ? "Live Marketplace" : "लाइव मार्केटप्लेस",
                  desc: language === "en" ? "Real-time supplier network" : "रियल-टाइम आपूर्तिकर्ता नेटवर्क",
                },
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                  <span className="text-2xl">{benefit.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{benefit.title}</p>
                    <p className="text-sm text-gray-600">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <Card className="glass-card shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">
                {language === "en" ? "Create Account" : "खाता बनाएं"}
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
                      onClick={() => handleInputChange("type", type.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        formData.type === type.value
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

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    {language === "en" ? "Full Name" : "पूरा नाम"}
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder={language === "en" ? "Enter your name" : "अपना नाम दर्ज करें"}
                    required
                    className="glass"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {language === "en" ? "Phone Number" : "फोन नंबर"}
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="glass"
                  />
                </div>
              </div>

              {/* Business Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    {language === "en" ? "Email Address" : "ईमेल पता"}
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder={language === "en" ? "Enter your email" : "अपना ईमेल दर्ज करें"}
                    required
                    className="glass"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    {language === "en" ? "Business Name" : "व्यवसाय का नाम"}
                  </label>
                  <Input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder={language === "en" ? "Your business name" : "आपके व्यवसाय का नाम"}
                    required
                    className="glass"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {language === "en" ? "Business Address" : "व्यवसाय का पता"}
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder={language === "en" ? "Enter your business address" : "अपने व्यवसाय का पता दर्ज करें"}
                  required
                  className="glass"
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en" ? "Password" : "पासवर्ड"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder={language === "en" ? "Create password" : "पासवर्ड बनाएं"}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en" ? "Confirm Password" : "पासवर्ड की पुष्टि करें"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder={language === "en" ? "Confirm password" : "पासवर्ड की पुष्टि करें"}
                      required
                      className="glass pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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
                    ? "Creating Account..."
                    : "खाता बनाया जा रहा है..."
                  : language === "en"
                    ? "Create Account"
                    : "खाता बनाएं"}
              </Button>
            </form>

            {/* Toggle to Login */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                {language === "en" ? "Already have an account?" : "पहले से खाता है?"}{" "}
                <button
                  onClick={onToggleMode}
                  className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                >
                  {language === "en" ? "Sign In" : "साइन इन करें"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
