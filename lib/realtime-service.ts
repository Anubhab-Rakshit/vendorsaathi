export interface NotificationData {
  id: string
  type:
    | "price_drop"
    | "new_inventory"
    | "seller_online"
    | "demand_spike"
    | "group_order"
    | "purchase_response"
    | "market_alert"
  title: string
  message: string
  priority: "high" | "medium" | "low"
  timestamp: string
  read: boolean
  data?: any
}

export interface MarketplaceItem {
  id: string
  name: string
  price: number
  unit: string
  seller: string
  quantity: number
  quality: string
  location: string
  distance: string
  lastUpdated: string
  inStock: boolean
  harvestDate?: string
  organic?: boolean
}

export interface Seller {
  id: string
  name: string
  location: string
  rating: number
  isOnline: boolean
  lastSeen: string
  specialties: string[]
  phone: string
  totalSales: number
}

class RealTimeService {
  private listeners: Array<(data: any) => void> = []
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null
  private eventListeners: { [key: string]: Array<(data: any) => void> } = {}
  private notifications: NotificationData[] = []
  private groupOrders: any[] = []
  private sellers: Seller[] = []
  private marketplaceItems: MarketplaceItem[] = []

  constructor() {
    this.startRealTimeUpdates()
  }

  // Subscribe method for notifications
  subscribe(callback: (data: any) => void): () => void {
    this.listeners.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Event system for marketplace
  on(event: string, callback: (data: any) => void) {
    // For now, treat all events the same as subscribe
    return this.subscribe(callback)
  }

  off(event: string, callback: () => void) {
    // Remove listener
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  emit(event: string, data: any) {
    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener({ event, data, timestamp: new Date() })
      } catch (error) {
        console.error("Error in listener:", error)
      }
    })
  }

  private startRealTimeUpdates() {
    if (this.isRunning) return

    this.isRunning = true

    // Generate updates every 30-45 seconds
    this.intervalId = setInterval(
      () => {
        this.generateRealTimeUpdate()
      },
      Math.random() * 15000 + 30000,
    ) // 30-45 seconds
  }

  private generateRealTimeUpdate() {
    const updateTypes = [
      "price_change",
      "inventory_update",
      "new_seller",
      "group_order_update",
      "demand_alert",
      "seller_activity",
    ]

    const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
    let updateData: any

    switch (updateType) {
      case "price_change":
        updateData = {
          type: "price_change",
          item: ["Onions", "Potatoes", "Tomatoes", "Oil"][Math.floor(Math.random() * 4)],
          oldPrice: Math.floor(Math.random() * 20) + 20,
          newPrice: Math.floor(Math.random() * 25) + 18,
          change: Math.random() > 0.5 ? "increase" : "decrease",
          seller: ["Ram Singh", "Sunita Devi", "Mohan Kumar"][Math.floor(Math.random() * 3)],
        }
        break

      case "inventory_update":
        updateData = {
          type: "inventory_update",
          item: ["Fresh Onions", "Premium Potatoes", "Organic Tomatoes"][Math.floor(Math.random() * 3)],
          quantity: Math.floor(Math.random() * 50) + 10,
          seller: ["Rajesh Vegetables", "Fresh Farm Co"][Math.floor(Math.random() * 2)],
          status: Math.random() > 0.3 ? "restocked" : "low_stock",
        }
        break

      case "new_seller":
        updateData = {
          type: "new_seller",
          seller: `${["Amit", "Priya", "Suresh", "Kavita"][Math.floor(Math.random() * 4)]} ${["Traders", "Suppliers", "Vegetables", "Fresh"][Math.floor(Math.random() * 4)]}`,
          location: ["Connaught Place", "Karol Bagh", "Lajpat Nagar"][Math.floor(Math.random() * 3)],
          speciality: ["Organic Vegetables", "Bulk Spices", "Fresh Produce"][Math.floor(Math.random() * 3)],
        }
        break

      case "group_order_update":
        updateData = {
          type: "group_order_update",
          item: ["Onions", "Cooking Oil", "Potatoes"][Math.floor(Math.random() * 3)],
          members: Math.floor(Math.random() * 5) + 8,
          target: 15,
          savings: Math.floor(Math.random() * 200) + 150,
          timeLeft: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 60)}m`,
        }
        break

      case "demand_alert":
        updateData = {
          type: "demand_alert",
          item: ["Tomatoes", "Chilies", "Ginger"][Math.floor(Math.random() * 3)],
          trend: Math.random() > 0.5 ? "increasing" : "decreasing",
          confidence: Math.floor(Math.random() * 20) + 80,
          reason: ["Festival season", "Weather change", "Supply shortage"][Math.floor(Math.random() * 3)],
        }
        break

      case "seller_activity":
        updateData = {
          type: "seller_activity",
          seller: ["Ram Singh", "Sunita Devi", "Mohan Kumar"][Math.floor(Math.random() * 3)],
          activity: Math.random() > 0.5 ? "came_online" : "updated_prices",
          items: Math.floor(Math.random() * 5) + 2,
        }
        break

      default:
        updateData = {
          type: "general_update",
          message: "Marketplace activity detected",
        }
    }

    // Emit to all listeners
    this.emit("realtime_update", updateData)
  }

  stop() {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isRunning,
      listeners: this.listeners.length,
      lastUpdate: new Date(),
    }
  }

  private initializeData() {
    // Initialize sellers
    this.sellers = [
      {
        id: "seller1",
        name: "Sunita Devi",
        location: "Karol Bagh Market",
        rating: 4.8,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        specialties: ["Fresh Vegetables", "Spices"],
        phone: "+91 98765 43210",
        totalSales: 1250,
      },
      {
        id: "seller2",
        name: "Ram Singh",
        location: "Chandni Chowk",
        rating: 4.6,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        specialties: ["Grains", "Pulses"],
        phone: "+91 98765 43211",
        totalSales: 980,
      },
      {
        id: "seller3",
        name: "Priya Sharma",
        location: "Lajpat Nagar",
        rating: 4.9,
        isOnline: false,
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        specialties: ["Organic Produce", "Herbs"],
        phone: "+91 98765 43212",
        totalSales: 1450,
      },
      {
        id: "seller4",
        name: "Amit Kumar",
        location: "Sarojini Nagar",
        rating: 4.5,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        specialties: ["Dairy", "Eggs"],
        phone: "+91 98765 43213",
        totalSales: 750,
      },
      {
        id: "seller5",
        name: "Meera Ji",
        location: "Khan Market",
        rating: 4.7,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        specialties: ["Premium Ingredients", "Imported Items"],
        phone: "+91 98765 43214",
        totalSales: 2100,
      },
    ]

    // Initialize marketplace items
    this.marketplaceItems = [
      {
        id: "item1",
        name: "Fresh Tomatoes",
        price: 45,
        unit: "kg",
        seller: "Sunita Devi",
        quantity: 50,
        quality: "Grade A",
        location: "Karol Bagh Market",
        distance: "2.3 km",
        lastUpdated: new Date().toISOString(),
        inStock: true,
        harvestDate: "2024-01-15",
        organic: false,
      },
      {
        id: "item2",
        name: "Red Onions",
        price: 35,
        unit: "kg",
        seller: "Ram Singh",
        quantity: 100,
        quality: "Grade A",
        location: "Chandni Chowk",
        distance: "3.1 km",
        lastUpdated: new Date().toISOString(),
        inStock: true,
        harvestDate: "2024-01-10",
        organic: false,
      },
      {
        id: "item3",
        name: "Green Chilies",
        price: 80,
        unit: "kg",
        seller: "Priya Sharma",
        quantity: 25,
        quality: "Premium",
        location: "Lajpat Nagar",
        distance: "4.2 km",
        lastUpdated: new Date().toISOString(),
        inStock: true,
        organic: true,
      },
      {
        id: "item4",
        name: "Fresh Coriander",
        price: 60,
        unit: "kg",
        seller: "Sunita Devi",
        quantity: 15,
        quality: "Grade A",
        location: "Karol Bagh Market",
        distance: "2.3 km",
        lastUpdated: new Date().toISOString(),
        inStock: true,
        organic: true,
      },
      {
        id: "item5",
        name: "Basmati Rice",
        price: 120,
        unit: "kg",
        seller: "Ram Singh",
        quantity: 200,
        quality: "Premium",
        location: "Chandni Chowk",
        distance: "3.1 km",
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
    ]

    // Add some initial notifications
    this.addNotification({
      type: "market_alert",
      title: "Welcome to VendorSaathi!",
      message:
        "Your AI-powered marketplace is now active. Get real-time updates on prices, inventory, and opportunities.",
      priority: "medium",
      data: { source: "system" },
    })
  }

  private initializeGroupOrders() {
    this.groupOrders = [
      {
        id: "group-1",
        item: "Premium Onions",
        targetQuantity: 50,
        currentQuantity: 32,
        pricePerUnit: 35,
        savings: 240,
        timeLeft: "2h 15m",
        members: ["Ram Singh", "Priya Devi", "Amit Kumar", "Sunita Devi"],
        organizer: "Ram Singh",
        location: "Karol Bagh Area",
        status: "active",
      },
      {
        id: "group-2",
        item: "Fresh Potatoes",
        targetQuantity: 75,
        currentQuantity: 45,
        pricePerUnit: 26,
        savings: 450,
        timeLeft: "4h 30m",
        members: ["Sunita Devi", "Raj Patel", "Meera Ji"],
        organizer: "Meera Ji",
        location: "Paharganj Area",
        status: "active",
      },
      {
        id: "group-3",
        item: "Green Chilies",
        targetQuantity: 20,
        currentQuantity: 18,
        pricePerUnit: 70,
        savings: 180,
        timeLeft: "1h 45m",
        members: ["Priya Sharma", "Kiran Bhai"],
        organizer: "Priya Sharma",
        location: "Lajpat Nagar Area",
        status: "active",
      },
    ]

    console.log("🎯 Group orders initialized:", this.groupOrders.length)
  }

  private addNotification(notification: Omit<NotificationData, "id" | "timestamp" | "read">) {
    const newNotification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    }

    this.notifications.unshift(newNotification)

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Show browser notification if permission granted
    this.showBrowserNotification(newNotification)
  }

  private showBrowserNotification(notification: NotificationData) {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    }
  }

  // Public methods
  getNotifications(): NotificationData[] {
    return this.notifications
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.emit("notification_read", {
        id: notificationId,
      })
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true))
    this.emit("all_notifications_read", {})
  }

  getGroupOrders(): any[] {
    return this.groupOrders.filter((order) => order.status === "active")
  }

  joinGroupOrder(orderId: string, quantity: number): boolean {
    const order = this.groupOrders.find((o) => o.id === orderId)
    if (order && order.status === "active") {
      const newQuantity = Math.min(order.currentQuantity + quantity, order.targetQuantity)
      order.currentQuantity = newQuantity

      this.emit("group_order", {
        item: order.item,
        currentQuantity: newQuantity,
        targetQuantity: order.targetQuantity,
        members: order.members,
        organizer: order.organizer,
        location: order.location,
        status: order.status,
      })

      return true
    }
    return false
  }

  getMarketplaceItems(): MarketplaceItem[] {
    return [...this.marketplaceItems]
  }

  getSellers(): Seller[] {
    return [...this.sellers]
  }

  requestNotificationPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }
}

export const realtimeService = new RealTimeService()
