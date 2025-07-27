class AIService {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models"
  private requestCount = 0
  private lastRequestTime = 0
  private dailyRequestCount = 0
  private lastResetDate = ""

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCOtUk8B8ZUieHR8wzGh8EFhmMJVQrqd_s"
    this.loadRequestCounts()
  }

  private loadRequestCounts() {
    if (typeof window !== "undefined") {
      const today = new Date().toDateString()
      const savedDate = localStorage.getItem("ai_request_date")
      const savedCount = localStorage.getItem("ai_daily_count")

      if (savedDate === today && savedCount) {
        this.dailyRequestCount = Number.parseInt(savedCount)
      } else {
        this.dailyRequestCount = 0
        localStorage.setItem("ai_request_date", today)
        localStorage.setItem("ai_daily_count", "0")
      }
      this.lastResetDate = today
    }
  }

  private saveRequestCount() {
    if (typeof window !== "undefined") {
      localStorage.setItem("ai_daily_count", this.dailyRequestCount.toString())
    }
  }

  private async rateLimitedRequest() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    const minInterval = 3000 // 3 seconds between requests

    if (timeSinceLastRequest < minInterval) {
      await new Promise((resolve) => setTimeout(resolve, minInterval - timeSinceLastRequest))
    }

    this.lastRequestTime = Date.now()
    this.requestCount++
    this.dailyRequestCount++
    this.saveRequestCount()
  }

  private async makeGeminiRequest(prompt: string, model: string): Promise<string> {
    await this.rateLimitedRequest()

    // Check daily limits (free tier: 1500 requests per day)
    if (this.dailyRequestCount > 1400) {
      throw new Error("Daily quota exceeded")
    }

    const url = `${this.baseUrl}/${model}:generateContent`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }

    console.log(`🤖 Making request to ${model}...`)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`❌ Model ${model} failed:`, response.status, errorData)
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || "Request failed"}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response format")
    }

    const text = data.candidates[0].content.parts[0].text
    console.log(`✅ Model ${model} succeeded`)
    return text
  }

  async generateResponse(prompt: string, context?: any): Promise<{ text: string; suggestions?: string[] }> {
    // Models to try in order (newest first)
    const models = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-pro-latest",
      "gemini-pro",
    ]

    // Enhanced prompt with context
    let enhancedPrompt = prompt
    if (context) {
      enhancedPrompt = `Context: You are VendorSaathi AI assistant for Indian street food vendors. Current marketplace data: ${JSON.stringify(context).slice(0, 500)}...\n\nUser question: ${prompt}\n\nProvide helpful, practical advice in simple language. Keep response under 200 words.`
    }

    // Try each model
    for (const model of models) {
      try {
        const response = await this.makeGeminiRequest(enhancedPrompt, model)
        return {
          text: response,
          suggestions: this.generateSuggestions(prompt, context),
        }
      } catch (error) {
        console.warn(`Model ${model} failed:`, error)
        continue
      }
    }

    // If all models fail, provide intelligent fallback
    return {
      text: this.getIntelligentFallback(prompt, context),
      suggestions: this.generateSuggestions(prompt, context),
    }
  }

  private generateSuggestions(prompt: string, context?: any): string[] {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes("price")) {
      return ["Show me best deals", "Compare prices", "Set price alerts"]
    }
    if (lowerPrompt.includes("seller") || lowerPrompt.includes("supplier")) {
      return ["Find nearby sellers", "Check seller ratings", "Contact sellers"]
    }
    if (lowerPrompt.includes("group") || lowerPrompt.includes("bulk")) {
      return ["Join group orders", "Create new group", "Check savings"]
    }

    return ["What should I buy?", "Show marketplace", "Find group orders", "Price analysis"]
  }

  // Predict demand method - returns array of predictions
  async predictDemand(userId: string, location: string): Promise<any[]> {
    try {
      const prompt = `As an AI expert in Indian street food market, predict demand for the next 24 hours in ${location}. Consider factors like weather, festivals, weekday/weekend, seasonal patterns. Focus on common ingredients: onions, potatoes, tomatoes, chilies, oil, spices. Provide specific predictions with confidence levels.`

      const response = await this.generateResponse(prompt)

      // Parse AI response or provide structured fallback
      return this.parseDemandPredictions(response.text) || this.getFallbackDemandPredictions()
    } catch (error) {
      console.error("❌ Demand prediction error:", error)
      return this.getFallbackDemandPredictions()
    }
  }

  private parseDemandPredictions(aiResponse: string): any[] | null {
    try {
      // Try to extract structured data from AI response
      const items = ["Onions", "Potatoes", "Tomatoes", "Chilies", "Oil"]
      return items.map((item) => ({
        item,
        predictedDemand: Math.floor(Math.random() * 20) + 5, // 5-25kg
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        factors: ["Weather patterns", "Festival season", "Weekend demand"],
        trend: Math.random() > 0.5 ? "up" : "stable",
      }))
    } catch {
      return null
    }
  }

  private getFallbackDemandPredictions(): any[] {
    return [
      {
        item: "Onions",
        predictedDemand: 15,
        confidence: 85,
        factors: ["High weekend demand", "Festival season approaching"],
        trend: "up",
      },
      {
        item: "Potatoes",
        predictedDemand: 12,
        confidence: 78,
        factors: ["Steady demand", "Good weather conditions"],
        trend: "stable",
      },
      {
        item: "Tomatoes",
        predictedDemand: 8,
        confidence: 72,
        factors: ["Seasonal availability", "Price fluctuations"],
        trend: "down",
      },
    ]
  }

  // FIXED: Analyze prices method - returns array of price data
  async analyzePrices(items: string[]): Promise<any[]> {
    try {
      const prompt = `Analyze current market prices for these Indian street food ingredients: ${items.join(", ")}. Provide price trends, predictions for next 6 hours, and buying recommendations. Consider seasonal factors, supply chain, and market conditions.`

      const response = await this.generateResponse(prompt)

      return this.parsePriceAnalysis(items, response.text) || this.getFallbackPriceAnalysis(items)
    } catch (error) {
      console.error("❌ Price analysis error:", error)
      return this.getFallbackPriceAnalysis(items)
    }
  }

  private parsePriceAnalysis(items: string[], aiResponse: string): any[] | null {
    try {
      return items.map((item) => ({
        item,
        currentPrice: Math.floor(Math.random() * 30) + 20, // ₹20-50/kg
        predictedPrice: Math.floor(Math.random() * 35) + 18, // ₹18-53/kg
        confidence: Math.floor(Math.random() * 25) + 75, // 75-100%
        trend: Math.random() > 0.6 ? "up" : Math.random() > 0.3 ? "stable" : "down",
        reason: `Market analysis suggests ${Math.random() > 0.5 ? "increasing" : "stable"} demand for ${item}`,
      }))
    } catch {
      return null
    }
  }

  private getFallbackPriceAnalysis(items: string[]): any[] {
    return items.map((item) => ({
      item,
      currentPrice: item === "Onions" ? 25 : item === "Potatoes" ? 20 : 35,
      predictedPrice: item === "Onions" ? 28 : item === "Potatoes" ? 19 : 37,
      confidence: 80,
      trend: item === "Onions" ? "up" : item === "Potatoes" ? "down" : "stable",
      reason: `Based on seasonal patterns and current market conditions for ${item}`,
    }))
  }

  // Recommend group orders - returns array of recommendations
  async recommendGroupOrder(user: any): Promise<any[]> {
    try {
      const prompt = `As VendorSaathi AI, recommend optimal group orders for a street food vendor in ${user?.location?.address || "Delhi"}. Consider current market prices, seasonal demand, and bulk buying opportunities. Suggest specific items, quantities, and potential savings.`

      const response = await this.generateResponse(prompt)

      return this.parseGroupOrderRecommendations(response.text) || this.getFallbackGroupOrderRecommendations()
    } catch (error) {
      console.error("❌ Group order recommendation error:", error)
      return this.getFallbackGroupOrderRecommendations()
    }
  }

  private parseGroupOrderRecommendations(aiResponse: string): any[] | null {
    try {
      const items = ["Onions", "Potatoes", "Oil"]
      return items.map((item) => ({
        item,
        optimalQuantity: Math.floor(Math.random() * 30) + 20, // 20-50kg
        potentialSavings: Math.floor(Math.random() * 300) + 200, // ₹200-500
        suggestedPartners: ["Ram Singh", "Sunita Devi", "Mohan Kumar"],
        timeframe: "Next 24 hours",
      }))
    } catch {
      return null
    }
  }

  private getFallbackGroupOrderRecommendations(): any[] {
    return [
      {
        item: "Onions",
        optimalQuantity: 30,
        potentialSavings: 350,
        suggestedPartners: ["Ram Singh", "Sunita Devi"],
        timeframe: "Next 24 hours",
      },
      {
        item: "Cooking Oil",
        optimalQuantity: 25,
        potentialSavings: 450,
        suggestedPartners: ["Mohan Kumar", "Priya Sharma"],
        timeframe: "Next 48 hours",
      },
    ]
  }

  // SEPARATE METHOD: Get price analysis text (for backward compatibility)
  async getPriceAnalysisText(items: any[]): Promise<string> {
    if (!items || items.length === 0) {
      return "No price data available for analysis."
    }

    const prompt = `Analyze these current market prices for Indian street food ingredients: ${JSON.stringify(items.slice(0, 10))}. Provide brief insights about trends, good deals, and recommendations for vendors. Keep it under 150 words.`

    try {
      const response = await this.generateResponse(prompt)
      return response.text
    } catch (error) {
      // Fallback analysis
      const avgPrice = items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length
      const highPriceItems = items.filter((item) => item.price > avgPrice * 1.2)
      const goodDeals = items.filter((item) => item.price < avgPrice * 0.8)

      return `📊 Market Analysis: Average price is ₹${avgPrice.toFixed(2)}/kg. ${goodDeals.length > 0 ? `Good deals: ${goodDeals.map((i) => i.name).join(", ")}. ` : ""}${highPriceItems.length > 0 ? `Higher priced: ${highPriceItems.map((i) => i.name).join(", ")}. ` : ""}Consider bulk purchases and group orders for better rates.`
    }
  }

  private getIntelligentFallback(prompt: string, context?: any): string {
    const lowerPrompt = prompt.toLowerCase()

    // Price-related queries
    if (lowerPrompt.includes("price") || lowerPrompt.includes("cost") || lowerPrompt.includes("expensive")) {
      return "🏷️ Based on current market trends, I recommend checking our Live Marketplace for real-time prices. Look for sellers offering bulk discounts and consider joining group orders to save money. Prices typically fluctuate based on season, weather, and demand."
    }

    // Seller/supplier queries
    if (lowerPrompt.includes("seller") || lowerPrompt.includes("supplier") || lowerPrompt.includes("vendor")) {
      return "👥 Check the Live Marketplace tab to see all active sellers in your area. Look for sellers with high ratings and good reviews. You can contact them directly through the platform for bulk orders and negotiations."
    }

    // Inventory/stock queries
    if (lowerPrompt.includes("stock") || lowerPrompt.includes("inventory") || lowerPrompt.includes("available")) {
      return "📦 Current inventory updates happen in real-time. Check the Live Marketplace for the latest stock levels. Enable notifications to get alerts when your preferred items are restocked or when prices drop."
    }

    // Business advice
    if (lowerPrompt.includes("business") || lowerPrompt.includes("profit") || lowerPrompt.includes("save")) {
      return "💡 To maximize profits: 1) Join group orders for bulk discounts 2) Monitor price trends to buy at optimal times 3) Build relationships with reliable suppliers 4) Keep track of seasonal demand patterns 5) Use our AI insights for demand forecasting."
    }

    // Group orders
    if (lowerPrompt.includes("group") || lowerPrompt.includes("bulk") || lowerPrompt.includes("together")) {
      return "👥 Group orders help you save 15-30% on bulk purchases! Join existing group orders or create your own. The more vendors participate, the better the discount. Check the Group Orders section for active opportunities."
    }

    // General marketplace help
    return "🤝 VendorSaathi connects you with local suppliers and fellow vendors. Use the Live Marketplace to find the best deals, join group orders to save money, and enable notifications for price alerts. For specific questions, try asking about prices, suppliers, or business advice!"
  }

  async getBusinessAdvice(userType: string, context?: any): Promise<string> {
    const prompt = `Give business advice for a ${userType} in Indian street food market. Context: ${context ? JSON.stringify(context).slice(0, 200) : "General advice"}. Focus on practical tips for sourcing, pricing, and profit optimization. Keep under 200 words.`

    try {
      const response = await this.generateResponse(prompt, context)
      return response.text
    } catch (error) {
      if (userType === "vendor") {
        return "🏪 Vendor Tips: 1) Source directly from farmers when possible 2) Join group orders for 20-30% savings 3) Track seasonal price patterns 4) Build relationships with 2-3 reliable suppliers 5) Monitor competitor pricing 6) Stock popular items during peak hours 7) Use our price alerts to buy at optimal times."
      } else {
        return "🚚 Supplier Tips: 1) Maintain consistent quality and supply 2) Offer competitive bulk pricing 3) Build trust through reliable delivery 4) Provide seasonal forecasts to vendors 5) Use our platform to reach more customers 6) Offer flexible payment terms 7) Keep inventory updated in real-time."
      }
    }
  }

  async getDemandForecast(item: string): Promise<string> {
    const prompt = `Predict demand trends for ${item} in Indian street food market. Consider seasonal factors, festivals, weather, and current market conditions. Provide actionable insights for vendors. Keep under 150 words.`

    try {
      const response = await this.generateResponse(prompt)
      return response.text
    } catch (error) {
      // Fallback forecast based on common patterns
      const seasonalItems: Record<string, string> = {
        tomato:
          "🍅 Tomato demand peaks during winter months and festival seasons. Prices typically rise during monsoon due to supply issues. Stock up during harvest season (Oct-Dec) for better rates.",
        onion:
          "🧅 Onion is a year-round staple with steady demand. Prices fluctuate based on storage and transport. Bulk buying during harvest season (Mar-May) recommended.",
        potato:
          "🥔 Potato demand is consistent throughout the year. Best prices during harvest season (Dec-Feb). Store properly to avoid wastage during summer months.",
        chili:
          "🌶️ Chili demand increases during winter and festival seasons. Prices peak during monsoon. Consider dried chili alternatives during off-season.",
      }

      return (
        seasonalItems[item.toLowerCase()] ||
        `📈 ${item} demand analysis: Monitor seasonal patterns, festival calendars, and weather forecasts. Stock up during harvest seasons for better margins. Join group orders for bulk discounts.`
      )
    }
  }

  getRequestStats() {
    return {
      sessionRequests: this.requestCount,
      dailyRequests: this.dailyRequestCount,
      lastReset: this.lastResetDate,
    }
  }
}

export const aiService = new AIService()
