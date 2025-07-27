"use client"

import { database } from "./database"

interface AIResponse {
  analysis: string
  confidence: string
  itemsAnalyzed: number
  dataSource: string
  timestamp: string
  suggestions?: string[]
}

class EnhancedAIService {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
  }

  async analyzeRealMarketData(): Promise<AIResponse> {
    try {
      // Get ONLY real data from database - NO MOCK DATA
      const [items, transactions, analytics] = await Promise.all([
        database.getItems({ available: true }),
        database.getTransactions(),
        database.getMarketAnalytics(),
      ])

      console.log("🤖 Analyzing REAL market data:", {
        items: items.length,
        transactions: transactions.length,
        analytics: Object.keys(analytics).length,
      })

      if (items.length === 0) {
        return {
          analysis:
            "📊 **No Real Market Data Available**\n\nThe marketplace is currently empty. To get AI insights:\n\n• **Sellers**: List your items to populate the marketplace\n• **Vendors**: Browse and purchase items to generate transaction data\n• **Suppliers**: Add bulk items for vendors\n\nOnce there's real data, I'll provide detailed market analysis, price trends, and demand predictions based on actual marketplace activity.",
          confidence: "N/A",
          itemsAnalyzed: 0,
          dataSource: "Empty Database",
          timestamp: new Date().toISOString(),
          suggestions: ["List your first item", "Browse marketplace", "Check back later", "Invite other users"],
        }
      }

      // Prepare comprehensive real market data for AI analysis
      const marketSummary = {
        totalItems: items.length,
        availableItems: items.filter((i) => i.available).length,
        categories: [...new Set(items.map((i) => i.category))],
        priceRanges: this.calculatePriceRanges(items),
        popularItems: items.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
        recentTransactions: transactions.slice(0, 10),
        totalTransactions: transactions.length,
        completedTransactions: transactions.filter((t) => t.status === "completed").length,
        pendingTransactions: transactions.filter((t) => t.status === "pending").length,
        analytics,
        averagePrice: items.reduce((sum, item) => sum + item.price, 0) / items.length,
        totalMarketValue: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }

      const prompt = `
        Analyze this REAL VendorSaathi marketplace data for Indian street food vendors and provide actionable insights:

        **REAL MARKETPLACE DATA:**
        - Total Items Listed: ${marketSummary.totalItems}
        - Available Items: ${marketSummary.availableItems}
        - Categories: ${marketSummary.categories.join(", ")}
        - Total Transactions: ${marketSummary.totalTransactions}
        - Completed Sales: ${marketSummary.completedTransactions}
        - Pending Orders: ${marketSummary.pendingTransactions}
        - Average Price: ₹${marketSummary.averagePrice.toFixed(2)}
        - Total Market Value: ₹${marketSummary.totalMarketValue.toLocaleString()}

        **TOP PERFORMING ITEMS:**
        ${marketSummary.popularItems
          .map(
            (item) =>
              `• ${item.name}: ₹${item.price}/${item.unit} (${item.views || 0} views, ${item.quantity} available)`,
          )
          .join("\n")}

        **PRICE ANALYSIS BY CATEGORY:**
        ${Object.entries(marketSummary.priceRanges)
          .map(
            ([category, data]: [string, any]) =>
              `• ${category}: ₹${data.min}-₹${data.max} (avg: ₹${data.avg.toFixed(2)})`,
          )
          .join("\n")}

        **RECENT TRANSACTION ACTIVITY:**
        ${marketSummary.recentTransactions.map((t) => `• ${t.itemName}: ${t.status} - ₹${t.totalAmount}`).join("\n")}

        Provide a comprehensive analysis covering:
        1. **Market Health & Trends** - Current state and growth patterns
        2. **Price Optimization** - Competitive pricing insights
        3. **Demand Patterns** - What's selling well and why
        4. **Vendor Recommendations** - Best items to buy/stock
        5. **Seller Opportunities** - High-demand items to list
        6. **Market Gaps** - Underserved categories or price points

        Keep the response practical, actionable, and specific to Indian street food business needs.
        Use real numbers from the data provided.
      `

      const response = await this.callGeminiAPI(prompt)

      return {
        analysis: response || this.getFallbackAnalysis(marketSummary),
        confidence: response ? "High (AI + Real Data)" : "Medium (Real Data Only)",
        itemsAnalyzed: items.length,
        dataSource: response ? "Gemini AI + Real IndexedDB" : "Real IndexedDB Analysis",
        timestamp: new Date().toISOString(),
        suggestions: this.generateSmartSuggestions(marketSummary),
      }
    } catch (error) {
      console.error("❌ AI Analysis failed:", error)

      // Fallback to database-only analysis
      try {
        const items = await database.getItems()
        const transactions = await database.getTransactions()

        return {
          analysis: this.getFallbackAnalysis({
            totalItems: items.length,
            totalTransactions: transactions.length,
            completedTransactions: transactions.filter((t) => t.status === "completed").length,
          }),
          confidence: "Medium (Database Only)",
          itemsAnalyzed: items.length,
          dataSource: "Real Database (AI Unavailable)",
          timestamp: new Date().toISOString(),
          suggestions: ["Check AI connection", "Try again later", "View raw data"],
        }
      } catch (dbError) {
        return {
          analysis:
            "❌ **Analysis Unavailable**\n\nBoth AI service and database are currently unavailable. Please check your connection and try again.",
          confidence: "Low",
          itemsAnalyzed: 0,
          dataSource: "Error State",
          timestamp: new Date().toISOString(),
          suggestions: ["Refresh page", "Check connection", "Contact support"],
        }
      }
    }
  }

  async generateResponse(message: string, context?: any): Promise<any> {
    try {
      // Get REAL market context - NO MOCK DATA
      const [items, transactions, analytics] = await Promise.all([
        database.getItems(),
        database.getTransactions(),
        database.getMarketAnalytics(),
      ])

      const realMarketContext = {
        totalItems: items.length,
        availableItems: items.filter((i) => i.available).length,
        recentTransactions: transactions.slice(0, 5),
        popularCategories: analytics.categoryDistribution,
        totalTransactions: transactions.length,
        completedSales: transactions.filter((t) => t.status === "completed").length,
        ...context,
      }

      console.log("🤖 AI Chat with REAL data context:", realMarketContext)

      const prompt = `
        You are VendorSaathi AI, helping Indian street food vendors with their business using REAL marketplace data.

        **CURRENT REAL MARKET CONTEXT:**
        - Items in marketplace: ${realMarketContext.totalItems}
        - Available items: ${realMarketContext.availableItems}
        - Total transactions: ${realMarketContext.totalTransactions}
        - Completed sales: ${realMarketContext.completedSales}
        - Active categories: ${Object.keys(realMarketContext.popularCategories || {}).join(", ")}

        **RECENT REAL TRANSACTIONS:**
        ${realMarketContext.recentTransactions
          .map((t: any) => `• ${t.itemName}: ${t.status} - ₹${t.totalAmount}`)
          .join("\n")}

        User Message: "${message}"

        Provide helpful, practical advice based on this REAL market data. 
        Be specific about actual items, prices, and trends from the database.
        If no data exists, guide users on how to populate the marketplace.
        
        Return response as JSON with:
        {
          "response": "your helpful response based on real data",
          "suggestions": ["actionable suggestion 1", "suggestion 2", "suggestion 3"],
          "confidence": "high/medium/low",
          "dataSource": "real marketplace data"
        }
      `

      const response = await this.callGeminiAPI(prompt)

      if (response) {
        try {
          const parsed = JSON.parse(response)
          return {
            ...parsed,
            dataSource: "AI + Real Database",
            realDataUsed: true,
          }
        } catch {
          return {
            response: response,
            suggestions: this.generateContextualSuggestions(message, realMarketContext),
            confidence: "medium",
            dataSource: "AI + Real Database",
            realDataUsed: true,
          }
        }
      }

      // Fallback response with real data
      return this.generateFallbackResponse(message, realMarketContext)
    } catch (error) {
      console.error("❌ AI response generation failed:", error)
      return {
        response: "I'm having trouble accessing the marketplace data right now. Please try again in a moment.",
        suggestions: ["Try again", "Check connection", "View marketplace directly"],
        confidence: "low",
        dataSource: "error fallback",
        realDataUsed: false,
      }
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string | null> {
    if (!this.apiKey) {
      console.warn("⚠️ Gemini API key not found")
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      })

      if (!response.ok) {
        console.error("❌ Gemini API error:", response.status, response.statusText)
        return null
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null
    } catch (error) {
      console.error("❌ Gemini API call failed:", error)
      return null
    }
  }

  private calculatePriceRanges(items: any[]) {
    const categories: { [key: string]: { min: number; max: number; avg: number } } = {}

    items.forEach((item) => {
      const cat = item.category || "Other"
      if (!categories[cat]) {
        categories[cat] = { min: item.price, max: item.price, avg: 0 }
      }
      categories[cat].min = Math.min(categories[cat].min, item.price)
      categories[cat].max = Math.max(categories[cat].max, item.price)
    })

    // Calculate averages
    Object.keys(categories).forEach((cat) => {
      const categoryItems = items.filter((i) => (i.category || "Other") === cat)
      categories[cat].avg = categoryItems.reduce((sum, i) => sum + i.price, 0) / categoryItems.length
    })

    return categories
  }

  private getFallbackAnalysis(data: any): string {
    if (data.totalItems === 0) {
      return `📊 **Marketplace Status: Empty**\n\nThe VendorSaathi marketplace is ready but needs content:\n\n🏪 **For Sellers:**\n• List your first items to start earning\n• Focus on popular street food ingredients\n• Set competitive prices\n\n🛒 **For Vendors:**\n• Check back soon for new listings\n• Consider reaching out to local suppliers\n• Join our community to connect with sellers\n\n📈 **Growth Opportunity:**\nBe among the first to establish your presence in this growing marketplace!`
    }

    return `📊 **Real Marketplace Analysis**\n\n**Current Status:**\n• ${data.totalItems} items actively listed\n• ${data.totalTransactions || 0} total transactions processed\n• ${data.completedTransactions || 0} successful sales completed\n\n**Market Health:** ${data.totalItems > 10 ? "🟢 Active" : data.totalItems > 5 ? "🟡 Growing" : "🔴 Emerging"}\n\n**Key Insights:**\n• Transaction rate: ${data.totalTransactions > 0 ? (((data.completedTransactions || 0) / data.totalTransactions) * 100).toFixed(1) : 0}% completion\n• Market activity is ${data.totalItems > 20 ? "high" : data.totalItems > 10 ? "moderate" : "building"}\n• ${data.totalItems > 0 ? "Real user-generated content" : "Awaiting first listings"}\n\n**Recommendations:**\n• Focus on high-demand items like onions, potatoes, spices\n• Competitive pricing based on real market data\n• Build relationships with active buyers/sellers\n\nThis analysis is based on real marketplace data and user activity.`
  }

  private generateSmartSuggestions(marketData: any): string[] {
    const suggestions = []

    if (marketData.totalItems === 0) {
      return ["List your first item", "Invite sellers to join", "Browse empty categories", "Set up price alerts"]
    }

    if (marketData.pendingTransactions > 0) {
      suggestions.push("Check pending orders")
    }

    if (marketData.popularItems.length > 0) {
      suggestions.push(`Analyze ${marketData.popularItems[0].name} demand`)
    }

    if (marketData.categories.length < 5) {
      suggestions.push("Explore underserved categories")
    }

    suggestions.push("View price trends", "Find bulk opportunities", "Check competitor pricing")

    return suggestions.slice(0, 4)
  }

  private generateContextualSuggestions(message: string, context: any): string[] {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return ["Compare current prices", "Set price alerts", "View price history", "Find best deals"]
    }

    if (lowerMessage.includes("sell") || lowerMessage.includes("list")) {
      return ["List new item", "Check market demand", "Set competitive price", "View seller tips"]
    }

    if (lowerMessage.includes("buy") || lowerMessage.includes("purchase")) {
      return ["Browse marketplace", "Find bulk deals", "Check vendor inventory", "Compare sellers"]
    }

    return ["View marketplace", "Check analytics", "Find opportunities", "Get recommendations"]
  }

  private generateFallbackResponse(message: string, context: any): any {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("marketplace") || lowerMessage.includes("items")) {
      return {
        response: `📊 **Real Marketplace Status:**\n\n• **${context.totalItems}** items currently listed\n• **${context.availableItems}** items available for purchase\n• **${context.totalTransactions}** total transactions\n• **${context.completedSales}** successful sales\n\n${context.totalItems === 0 ? "The marketplace is ready for your first listing!" : "Browse real items from verified sellers and suppliers."}`,
        suggestions:
          context.totalItems === 0
            ? ["List first item", "Invite sellers", "Check back later"]
            : ["Browse items", "Check prices", "View categories", "Find sellers"],
        confidence: "high",
        dataSource: "Real Database",
        realDataUsed: true,
      }
    }

    return {
      response: `🤖 **VendorSaathi AI Assistant**\n\nI'm here to help with your street food business using real marketplace data:\n\n• **${context.totalItems}** items in marketplace\n• **${context.totalTransactions}** transactions processed\n• **${context.availableItems}** items available now\n\nHow can I help you grow your business today?`,
      suggestions: ["Show marketplace", "Price analysis", "Find opportunities", "Business insights"],
      confidence: "medium",
      dataSource: "Real Database",
      realDataUsed: true,
    }
  }
}

export const enhancedAIService = new EnhancedAIService()
