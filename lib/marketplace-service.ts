interface InventoryItem {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  quality: string
  description: string
  sellerId: string
  sellerName: string
  sellerRating: number
  sellerPhone: string
  sellerLocation: string
  available: boolean
  lastUpdated: Date
  distance?: string
}

interface Seller {
  id: string
  name: string
  rating: number
  phoneNumber: string
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  specialties: string[]
  isOnline: boolean
  lastSeen: Date
  totalSales: number
  joinedDate: Date
}

class MarketplaceService {
  private inventory: InventoryItem[] = []
  private sellers: Seller[] = []
  private eventListeners: ((data: any) => void)[] = []
  private groupOrders: any[] = []

  constructor() {
    this.initializeData()
    this.startRealTimeUpdates()
  }

  private initializeData() {
    // Initialize sellers
    this.sellers = [
      {
        id: "seller1",
        name: "Ram Singh",
        rating: 4.8,
        phoneNumber: "+91 98765 43210",
        location: {
          address: "Connaught Place, New Delhi",
          coordinates: { lat: 28.6315, lng: 77.2167 },
        },
        specialties: ["Fresh Vegetables", "Organic Produce"],
        isOnline: true,
        lastSeen: new Date(),
        totalSales: 1250,
        joinedDate: new Date("2023-01-15"),
      },
      {
        id: "seller2",
        name: "Sunita Devi",
        rating: 4.6,
        phoneNumber: "+91 98765 43211",
        location: {
          address: "Karol Bagh, New Delhi",
          coordinates: { lat: 28.6519, lng: 77.1909 },
        },
        specialties: ["Bulk Supplies", "Competitive Prices"],
        isOnline: true,
        lastSeen: new Date(),
        totalSales: 980,
        joinedDate: new Date("2023-02-20"),
      },
      {
        id: "seller3",
        name: "Mohan Kumar",
        rating: 4.7,
        phoneNumber: "+91 98765 43212",
        location: {
          address: "Lajpat Nagar, New Delhi",
          coordinates: { lat: 28.5677, lng: 77.2431 },
        },
        specialties: ["Premium Quality", "Fast Delivery"],
        isOnline: Math.random() > 0.3,
        lastSeen: new Date(Date.now() - Math.random() * 3600000),
        totalSales: 1100,
        joinedDate: new Date("2023-03-10"),
      },
      {
        id: "seller4",
        name: "Priya Sharma",
        rating: 4.9,
        phoneNumber: "+91 98765 43213",
        location: {
          address: "Chandni Chowk, New Delhi",
          coordinates: { lat: 28.6506, lng: 77.2334 },
        },
        specialties: ["Traditional Spices", "Authentic Products"],
        isOnline: Math.random() > 0.4,
        lastSeen: new Date(Date.now() - Math.random() * 7200000),
        totalSales: 1350,
        joinedDate: new Date("2022-12-05"),
      },
    ]

    // Initialize inventory
    this.inventory = [
      {
        id: "item1",
        name: "Fresh Onions",
        price: 25,
        quantity: 50,
        unit: "kg",
        quality: "Premium",
        description: "Fresh red onions, perfect for street food preparation",
        sellerId: "seller1",
        sellerName: "Ram Singh",
        sellerRating: 4.8,
        sellerPhone: "+91 98765 43210",
        sellerLocation: "Connaught Place",
        available: true,
        lastUpdated: new Date(),
        distance: "150m",
      },
      {
        id: "item2",
        name: "Premium Potatoes",
        price: 20,
        quantity: 75,
        unit: "kg",
        quality: "Standard",
        description: "High-quality potatoes, ideal for frying and cooking",
        sellerId: "seller2",
        sellerName: "Sunita Devi",
        sellerRating: 4.6,
        sellerPhone: "+91 98765 43211",
        sellerLocation: "Karol Bagh",
        available: true,
        lastUpdated: new Date(),
        distance: "200m",
      },
      {
        id: "item3",
        name: "Organic Tomatoes",
        price: 35,
        quantity: 30,
        unit: "kg",
        quality: "Premium",
        description: "Organic tomatoes, fresh from farm",
        sellerId: "seller3",
        sellerName: "Mohan Kumar",
        sellerRating: 4.7,
        sellerPhone: "+91 98765 43212",
        sellerLocation: "Lajpat Nagar",
        available: true,
        lastUpdated: new Date(),
        distance: "300m",
      },
      {
        id: "item4",
        name: "Green Chilies",
        price: 40,
        quantity: 15,
        unit: "kg",
        quality: "Premium",
        description: "Fresh green chilies, perfect spice level",
        sellerId: "seller4",
        sellerName: "Priya Sharma",
        sellerRating: 4.9,
        sellerPhone: "+91 98765 43213",
        sellerLocation: "Chandni Chowk",
        available: true,
        lastUpdated: new Date(),
        distance: "400m",
      },
      {
        id: "item5",
        name: "Cooking Oil",
        price: 120,
        quantity: 20,
        unit: "L",
        quality: "Standard",
        description: "Refined cooking oil, suitable for deep frying",
        sellerId: "seller1",
        sellerName: "Ram Singh",
        sellerRating: 4.8,
        sellerPhone: "+91 98765 43210",
        sellerLocation: "Connaught Place",
        available: true,
        lastUpdated: new Date(),
        distance: "150m",
      },
      {
        id: "item6",
        name: "Basmati Rice",
        price: 80,
        quantity: 40,
        unit: "kg",
        quality: "Premium",
        description: "Premium basmati rice, long grain",
        sellerId: "seller2",
        sellerName: "Sunita Devi",
        sellerRating: 4.6,
        sellerPhone: "+91 98765 43211",
        sellerLocation: "Karol Bagh",
        available: true,
        lastUpdated: new Date(),
        distance: "200m",
      },
      {
        id: "item7",
        name: "Mixed Spices",
        price: 150,
        quantity: 10,
        unit: "kg",
        quality: "Premium",
        description: "Traditional spice mix for authentic flavors",
        sellerId: "seller4",
        sellerName: "Priya Sharma",
        sellerRating: 4.9,
        sellerPhone: "+91 98765 43213",
        sellerLocation: "Chandni Chowk",
        available: true,
        lastUpdated: new Date(),
        distance: "400m",
      },
      {
        id: "item8",
        name: "Fresh Ginger",
        price: 60,
        quantity: 25,
        unit: "kg",
        quality: "Standard",
        description: "Fresh ginger root, aromatic and flavorful",
        sellerId: "seller3",
        sellerName: "Mohan Kumar",
        sellerRating: 4.7,
        sellerPhone: "+91 98765 43212",
        sellerLocation: "Lajpat Nagar",
        available: true,
        lastUpdated: new Date(),
        distance: "300m",
      },
    ]

    // Initialize group orders
    this.groupOrders = [
      {
        id: "group1",
        item: "Onions",
        quantity: "50kg",
        currentMembers: 8,
        targetMembers: 12,
        savings: "₹240",
        timeLeft: "2h 30m",
        status: "active",
        location: "Connaught Place",
        organizer: "Ram Singh",
      },
      {
        id: "group2",
        item: "Potatoes",
        quantity: "75kg",
        currentMembers: 15,
        targetMembers: 15,
        savings: "₹450",
        timeLeft: "Ready!",
        status: "ready",
        location: "Karol Bagh",
        organizer: "Sunita Devi",
      },
    ]
  }

  // Get available inventory
  getAvailableInventory(): InventoryItem[] {
    return this.inventory.filter((item) => item.available)
  }

  // Get online sellers
  getOnlineSellers(): Seller[] {
    return this.sellers.filter((seller) => seller.isOnline)
  }

  // Get all sellers
  getSellers(): Seller[] {
    return this.sellers
  }

  // Get seller by ID
  getSellerById(sellerId: string): Seller | undefined {
    return this.sellers.find((seller) => seller.id === sellerId)
  }

  // Get seller (alias for getSellerById)
  getSeller(sellerId: string): Seller | undefined {
    return this.getSellerById(sellerId)
  }

  // Event system
  on(event: string, callback: (data: any) => void) {
    this.eventListeners.push(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const index = this.eventListeners.indexOf(callback)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  emit(event: string, data: any) {
    this.eventListeners.forEach((listener) => {
      try {
        listener({ event, data, timestamp: new Date() })
      } catch (error) {
        console.error("Error in marketplace listener:", error)
      }
    })
  }

  // Subscribe method for compatibility
  subscribe(callback: (data: any) => void): () => void {
    this.eventListeners.push(callback)

    return () => {
      const index = this.eventListeners.indexOf(callback)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }

  // Create purchase request
  createPurchaseRequest(itemId: string, quantity: number, buyerId: string) {
    const item = this.inventory.find((i) => i.id === itemId)
    if (!item) return null

    const purchaseRequest = {
      id: `purchase_${Date.now()}`,
      itemId,
      itemName: item.name,
      quantity,
      totalPrice: item.price * quantity,
      buyerId,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      status: "pending",
      createdAt: new Date(),
    }

    // Emit purchase request notification
    this.emit("marketplace_notification", {
      type: "purchase_request",
      data: purchaseRequest,
    })

    return purchaseRequest
  }

  // Start real-time updates
  private startRealTimeUpdates() {
    setInterval(
      () => {
        this.generateMarketplaceUpdate()
      },
      Math.random() * 15000 + 30000,
    ) // 30-45 seconds
  }

  private generateMarketplaceUpdate() {
    const updateTypes = ["price_change", "inventory_update", "seller_status", "new_item"]
    const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)]

    switch (updateType) {
      case "price_change":
        this.updateRandomPrice()
        break
      case "inventory_update":
        this.updateRandomInventory()
        break
      case "seller_status":
        this.updateSellerStatus()
        break
      case "new_item":
        this.addRandomItem()
        break
    }
  }

  private updateRandomPrice() {
    const item = this.inventory[Math.floor(Math.random() * this.inventory.length)]
    const oldPrice = item.price
    const change = Math.random() > 0.5 ? 1 : -1
    const newPrice = Math.max(10, item.price + Math.random() * 5 * change)

    item.price = Math.round(newPrice)
    item.lastUpdated = new Date()

    this.emit("marketplace_notification", {
      type: "price_change",
      data: {
        item: item.name,
        seller: item.sellerName,
        oldPrice,
        newPrice: item.price,
        change: item.price - oldPrice,
      },
    })
  }

  private updateRandomInventory() {
    const item = this.inventory[Math.floor(Math.random() * this.inventory.length)]
    const change = Math.floor(Math.random() * 20) - 10 // -10 to +10
    item.quantity = Math.max(0, item.quantity + change)
    item.available = item.quantity > 0
    item.lastUpdated = new Date()

    this.emit("marketplace_notification", {
      type: "inventory_update",
      data: {
        item: item.name,
        seller: item.sellerName,
        quantity: item.quantity,
        available: item.available,
        status: item.quantity === 0 ? "out_of_stock" : item.quantity < 10 ? "low_stock" : "in_stock",
      },
    })
  }

  private updateSellerStatus() {
    const seller = this.sellers[Math.floor(Math.random() * this.sellers.length)]
    seller.isOnline = Math.random() > 0.3
    seller.lastSeen = new Date()

    this.emit("marketplace_notification", {
      type: "seller_activity",
      data: {
        seller: seller.name,
        status: seller.isOnline ? "online" : "offline",
        lastSeen: seller.lastSeen,
      },
    })
  }

  private addRandomItem() {
    // Occasionally add new items to simulate dynamic marketplace
    if (Math.random() > 0.8) {
      const newItems = [
        "Fresh Coriander",
        "Mint Leaves",
        "Curry Leaves",
        "Garlic",
        "Turmeric Powder",
        "Red Chili Powder",
        "Cumin Seeds",
      ]

      const randomItem = newItems[Math.floor(Math.random() * newItems.length)]
      const randomSeller = this.sellers[Math.floor(Math.random() * this.sellers.length)]

      const newItem: InventoryItem = {
        id: `item_${Date.now()}`,
        name: randomItem,
        price: Math.floor(Math.random() * 50) + 20,
        quantity: Math.floor(Math.random() * 30) + 10,
        unit: "kg",
        quality: Math.random() > 0.5 ? "Premium" : "Standard",
        description: `Fresh ${randomItem.toLowerCase()} from ${randomSeller.name}`,
        sellerId: randomSeller.id,
        sellerName: randomSeller.name,
        sellerRating: randomSeller.rating,
        sellerPhone: randomSeller.phoneNumber,
        sellerLocation: randomSeller.location.address.split(",")[0],
        available: true,
        lastUpdated: new Date(),
        distance: `${Math.floor(Math.random() * 400) + 100}m`,
      }

      this.inventory.push(newItem)

      this.emit("marketplace_notification", {
        type: "new_item",
        data: {
          item: newItem.name,
          seller: newItem.sellerName,
          price: newItem.price,
          quantity: newItem.quantity,
        },
      })
    }
  }

  // Get marketplace stats
  getMarketplaceStats() {
    return {
      totalItems: this.inventory.length,
      availableItems: this.inventory.filter((i) => i.available).length,
      totalSellers: this.sellers.length,
      onlineSellers: this.sellers.filter((s) => s.isOnline).length,
      averagePrice: this.inventory.reduce((sum, item) => sum + item.price, 0) / this.inventory.length,
      lastUpdated: new Date(),
    }
  }
}

export const marketplaceService = new MarketplaceService()
