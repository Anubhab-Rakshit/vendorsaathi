"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Zap, ArrowRight, ShoppingCart, Star, Sparkles, Target, Globe, Brain } from "lucide-react"
import { useSocket } from "@/app/providers"

export default function RevolutionaryHero() {
  const [currentStat, setCurrentStat] = useState(0)
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { isConnected } = useSocket()
  const heroRef = useRef<HTMLElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)

  const stats = [
    {
      label: language === "en" ? "Active Vendors" : "सक्रिय विक्रेता",
      value: "2,847",
      icon: Users,
      change: "+12%",
      color: "from-blue-500 to-purple-500",
    },
    {
      label: language === "en" ? "Daily Savings" : "दैनिक बचत",
      value: "₹45,000",
      icon: TrendingUp,
      change: "+28%",
      color: "from-green-500 to-emerald-500",
    },
    {
      label: language === "en" ? "Group Orders" : "समूह ऑर्डर",
      value: "156",
      icon: ShoppingCart,
      change: "+45%",
      color: "from-orange-500 to-red-500",
    },
  ]

  const features = [
    {
      icon: Brain,
      title: language === "en" ? "AI Predictions" : "AI भविष्यवाणी",
      desc: language === "en" ? "94% accuracy in demand forecasting" : "94% सटीक मांग पूर्वानुमान",
    },
    {
      icon: Users,
      title: language === "en" ? "Smart Groups" : "स्मार्ट समूह",
      desc: language === "en" ? "Auto-form buying groups for better prices" : "बेहतर दामों के लिए ऑटो-समूह",
    },
    {
      icon: Globe,
      title: language === "en" ? "Real-time Sharing" : "रियल-टाइम शेयरिंग",
      desc: language === "en" ? "Share inventory with nearby vendors" : "पास के विक्रेताओं के साथ शेयर करें",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [stats.length])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset
        const rate = scrolled * -0.5
        parallaxRef.current.style.transform = `translateY(${rate}px)`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 market-pattern flex items-center"
    >
      {/* Parallax Background Elements */}
      <div ref={parallaxRef} className="absolute inset-0 parallax-layer">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-yellow-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Interactive Mouse Follower */}
      <div
        className="absolute w-96 h-96 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content with Advanced Animations */}
          <div className="space-y-8 scroll-reveal">
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center space-x-4">
                <Badge className="glass neon-border px-6 py-3 text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                    />
                    <Zap className="w-4 h-4" />
                    <span>{language === "en" ? "AI-Powered Live System" : "AI-संचालित लाइव सिस्टम"}</span>
                  </div>
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                  className="glass hover-glow"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "en" ? "हिं" : "EN"}
                </Button>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="gradient-text block">{language === "en" ? "Street Food" : "स्ट्रीट फूड"}</span>
                <span className="text-gray-800 block">{language === "en" ? "Revolution" : "क्रांति"}</span>
                <div className="flex items-center space-x-4 mt-4">
                  <Sparkles className="w-12 h-12 text-yellow-500 animate-spin" />
                  <span className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {language === "en" ? "3.0" : "३.०"}
                  </span>
                </div>
              </h1>

              {/* Description */}
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed font-medium">
                {language === "en"
                  ? "Transform your street food business with AI-powered smart sourcing, real-time inventory sharing, and intelligent group buying."
                  : "AI-संचालित स्मार्ट सोर्सिंग, रियल-टाइम इन्वेंटरी शेयरिंग, और बुद्धिमान समूह खरीदारी के साथ अपने स्ट्रीट फूड व्यापार को बदलें।"}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="glass-card px-4 py-2 rounded-full hover-lift cursor-pointer group">
                    <div className="flex items-center space-x-2">
                      <feature.icon className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-gray-700">{feature.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white px-10 py-6 text-xl font-bold rounded-2xl indian-shadow hover-glow overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center space-x-3 z-10">
                  <Target className="w-6 h-6" />
                  <span>{language === "en" ? "Start Revolution" : "क्रांति शुरू करें"}</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="glass border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-10 py-6 text-xl font-bold rounded-2xl hover-lift bg-transparent"
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6" />
                  <span>{language === "en" ? "Watch Magic" : "जादू देखें"}</span>
                </div>
              </Button>
            </div>

            {/* Live Stats with Advanced Animation */}
            <div className="glass-card rounded-3xl p-8 hover-lift">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                    {language === "en" ? "Live Impact Metrics" : "लाइव प्रभाव मेट्रिक्स"}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${stats[currentStat].color}`}>
                      {React.createElement(stats[currentStat].icon, {
                        className: "w-8 h-8 text-white",
                      })}
                    </div>
                    <div>
                      <p className="text-4xl font-black text-gray-800 gradient-text">{stats[currentStat].value}</p>
                      <p className="text-lg text-gray-600 font-medium">{stats[currentStat].label}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                          {stats[currentStat].change}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {language === "en" ? "vs last month" : "पिछले महीने से"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {stats.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        index === currentStat
                          ? "bg-gradient-to-r from-orange-500 to-red-500 scale-125"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Mini Chart Visualization */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${stat.color} mb-2`} />
                    <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Interactive Dashboard Preview */}
          <div className="relative scroll-reveal">
            {/* Main Dashboard Card */}
            <div className="glass-card rounded-3xl p-8 hover-lift relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 animate-pulse" />
              </div>

              <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 gradient-text">
                    {language === "en" ? "Today's AI Dashboard" : "आज का AI डैशबोर्ड"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800 animate-pulse">
                      <Star className="w-3 h-3 mr-1" />
                      {language === "en" ? "Live" : "लाइव"}
                    </Badge>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
                  </div>
                </div>

                {/* AI Predictions with Real-time Updates */}
                <div className="space-y-4">
                  <div className="glass rounded-2xl p-6 hover-glow border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                          🤖 {language === "en" ? "AI Prediction" : "AI भविष्यवाणी"}
                          <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">94% Sure</Badge>
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {language === "en"
                            ? "Tomorrow you'll need 15kg onions. Join Ram Ji's group order and save ₹120!"
                            : "कल आपको 15kg प्याज की जरूरत होगी। राम जी के समूह ऑर्डर में शामिल हों और ₹120 बचाएं!"}
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            {language === "en" ? "Join Group" : "समूह में शामिल हों"}
                          </Button>
                          <span className="text-xs text-green-600 font-medium">
                            ⏱️ {language === "en" ? "2h 30m left" : "2घ 30मि बचे"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 hover-glow border border-green-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                          📍 {language === "en" ? "Local Share Alert" : "स्थानीय शेयर अलर्ट"}
                          <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {language === "en"
                            ? "Sunita Didi has extra 8kg tomatoes, just 50m away. Contact now!"
                            : "सुनीता दीदी के पास अतिरिक्त 8kg टमाटर है, केवल 50m दूर। अभी संपर्क करें!"}
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            📞 {language === "en" ? "Call Now" : "अभी कॉल करें"}
                          </Button>
                          <Badge className="bg-green-100 text-green-800 text-xs">⭐ 4.9 Rating</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 hover-glow border border-orange-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                          💰 {language === "en" ? "Smart Price Alert" : "स्मार्ट मूल्य अलर्ट"}
                          <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">Hot Deal</Badge>
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {language === "en"
                            ? "Potato prices will drop ₹5/kg tomorrow at 10 AM. Wait for better deals!"
                            : "आलू की कीमत कल सुबह 10 बजे ₹5/kg गिरेगी। बेहतर डील का इंतजार करें!"}
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-300 text-orange-700 bg-transparent"
                          >
                            ⏰ {language === "en" ? "Set Reminder" : "रिमाइंडर सेट करें"}
                          </Button>
                          <span className="text-xs text-orange-600 font-medium">
                            📉 {language === "en" ? "Save ₹150" : "₹150 बचाएं"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl hover-glow">
                    <div className="text-center">
                      <Zap className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-sm font-medium">{language === "en" ? "AI Assistant" : "AI सहायक"}</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 glass border-2 border-orange-300 text-orange-700 rounded-xl hover-lift bg-transparent"
                  >
                    <div className="text-center">
                      <Target className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-sm font-medium">{language === "en" ? "Quick Order" : "त्वरित ऑर्डर"}</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Elements with Advanced Animations */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl hover-glow animate-bounce">
              <span className="text-3xl">🛒</span>
            </div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl hover-glow animate-pulse">
              <span className="text-2xl">🤝</span>
            </div>
            <div className="absolute top-1/2 -right-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl hover-glow animate-spin">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
