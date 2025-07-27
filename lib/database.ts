// Enhanced Database Layer with Inventory Management - COMPLETE WORKING VERSION
class VendorSaathiDB {
  private db: IDBDatabase | null = null
  private dbName = "VendorSaathiDB"
  private version = 5 // Increased for user sync fixes

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error("❌ IndexedDB open failed:", request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log("✅ IndexedDB initialized successfully")
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        console.log("🔄 Upgrading IndexedDB schema to version", this.version)

        // Users store
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id" })
          userStore.createIndex("email", "email", { unique: true })
          userStore.createIndex("phone", "phone", { unique: true })
          userStore.createIndex("type", "type", { unique: false })
          userStore.createIndex("userType", "userType", { unique: false }) // Add userType index
          console.log("📊 Created users store")
        }

        // Items store
        if (!db.objectStoreNames.contains("items")) {
          const itemStore = db.createObjectStore("items", { keyPath: "id" })
          itemStore.createIndex("sellerId", "sellerId", { unique: false })
          itemStore.createIndex("category", "category", { unique: false })
          itemStore.createIndex("available", "available", { unique: false })
          itemStore.createIndex("createdAt", "createdAt", { unique: false })
          itemStore.createIndex("price", "price", { unique: false })
          console.log("📦 Created items store")
        }

        // Transactions store
        if (!db.objectStoreNames.contains("transactions")) {
          const transactionStore = db.createObjectStore("transactions", { keyPath: "id" })
          transactionStore.createIndex("buyerId", "buyerId", { unique: false })
          transactionStore.createIndex("sellerId", "sellerId", { unique: false })
          transactionStore.createIndex("itemId", "itemId", { unique: false })
          transactionStore.createIndex("status", "status", { unique: false })
          transactionStore.createIndex("createdAt", "createdAt", { unique: false })
          console.log("💳 Created transactions store")
        }

        // Vendor Inventory store
        if (!db.objectStoreNames.contains("vendorInventory")) {
          const vendorInventoryStore = db.createObjectStore("vendorInventory", { keyPath: "id" })
          vendorInventoryStore.createIndex("vendorId", "vendorId", { unique: false })
          vendorInventoryStore.createIndex("itemName", "itemName", { unique: false })
          vendorInventoryStore.createIndex("category", "category", { unique: false })
          vendorInventoryStore.createIndex("status", "status", { unique: false })
          console.log("🏪 Created vendorInventory store")
        }

        // Seller Inventory store
        if (!db.objectStoreNames.contains("sellerInventory")) {
          const sellerInventoryStore = db.createObjectStore("sellerInventory", { keyPath: "id" })
          sellerInventoryStore.createIndex("sellerId", "sellerId", { unique: false })
          sellerInventoryStore.createIndex("itemId", "itemId", { unique: false })
          sellerInventoryStore.createIndex("status", "status", { unique: false })
          console.log("🛒 Created sellerInventory store")
        }

        // Price History store
        if (!db.objectStoreNames.contains("priceHistory")) {
          const priceStore = db.createObjectStore("priceHistory", { keyPath: "id" })
          priceStore.createIndex("itemName", "itemName", { unique: false })
          priceStore.createIndex("sellerId", "sellerId", { unique: false })
          priceStore.createIndex("timestamp", "timestamp", { unique: false })
          console.log("📈 Created priceHistory store")
        }

        // Notifications store
        if (!db.objectStoreNames.contains("notifications")) {
          const notificationStore = db.createObjectStore("notifications", { keyPath: "id" })
          notificationStore.createIndex("userId", "userId", { unique: false })
          notificationStore.createIndex("type", "type", { unique: false })
          notificationStore.createIndex("read", "read", { unique: false })
          notificationStore.createIndex("timestamp", "timestamp", { unique: false })
          console.log("🔔 Created notifications store")
        }
      }
    })
  }

  private ensureDB(): void {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.")
    }
  }

  // FIXED: User operations with better ID handling
  async createUser(user: any): Promise<string> {
    this.ensureDB()

    const transaction = this.db!.transaction(["users"], "readwrite")
    const store = transaction.objectStore("users")

    // Use provided ID or generate new one
    const userId = user.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newUser = {
      ...user,
      id: userId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      balance: user.balance || (user.type === "vendor" || user.userType === "vendor" ? 50000 : 0),
      // Store both type and userType for compatibility
      type: user.type || user.userType,
      userType: user.userType || user.type,
    }

    return new Promise((resolve, reject) => {
      // Check if user already exists
      const checkRequest = store.get(userId)

      checkRequest.onsuccess = () => {
        if (checkRequest.result) {
          console.log("ℹ️ User already exists, updating:", userId)
          // Update existing user
          const updateRequest = store.put(newUser)
          updateRequest.onsuccess = () => {
            console.log("✅ User updated in IndexedDB:", userId)
            resolve(userId)
          }
          updateRequest.onerror = () => {
            console.error("❌ Error updating user:", updateRequest.error)
            reject(updateRequest.error)
          }
        } else {
          // Create new user
          const addRequest = store.add(newUser)
          addRequest.onsuccess = () => {
            console.log("✅ User created in IndexedDB:", userId)
            resolve(userId)
          }
          addRequest.onerror = () => {
            console.error("❌ Error creating user:", addRequest.error)
            reject(addRequest.error)
          }
        }
      }

      checkRequest.onerror = () => {
        console.error("❌ Error checking user existence:", checkRequest.error)
        reject(checkRequest.error)
      }
    })
  }

  async getUser(id: string): Promise<any> {
    this.ensureDB()

    const transaction = this.db!.transaction(["users"], "readonly")
    const store = transaction.objectStore("users")

    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => {
        const user = request.result
        if (user) {
          console.log("✅ User found in database:", user)
        } else {
          console.log("⚠️ User not found in database:", id)
        }
        resolve(user)
      }
      request.onerror = () => {
        console.error("❌ Error getting user:", request.error)
        reject(request.error)
      }
    })
  }

  async getUserByEmail(email: string): Promise<any> {
    this.ensureDB()

    const transaction = this.db!.transaction(["users"], "readonly")
    const store = transaction.objectStore("users")
    const index = store.index("email")

    return new Promise((resolve, reject) => {
      const request = index.get(email)
      request.onsuccess = () => {
        const user = request.result
        if (user) {
          console.log("✅ User found by email:", user)
        } else {
          console.log("⚠️ User not found by email:", email)
        }
        resolve(user)
      }
      request.onerror = () => {
        console.error("❌ Error getting user by email:", request.error)
        reject(request.error)
      }
    })
  }

  // COMPLETELY REWRITTEN: Balance update method with bulletproof error handling
  async updateUserBalance(userId: string, newBalance: number): Promise<any> {
    console.log(`🚀 STARTING BALANCE UPDATE: User ${userId}, New Balance: ₹${newBalance}`)

    this.ensureDB()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["users"], "readwrite")
        const store = transaction.objectStore("users")

        // Set up transaction error handlers
        transaction.onerror = (event) => {
          console.error("❌ TRANSACTION ERROR:", event)
          reject(new Error(`Transaction failed: ${transaction.error?.message}`))
        }

        transaction.onabort = (event) => {
          console.error("❌ TRANSACTION ABORTED:", event)
          reject(new Error("Transaction was aborted"))
        }

        // Get the user first
        const getRequest = store.get(userId)

        getRequest.onerror = (event) => {
          console.error("❌ GET USER ERROR:", event)
          reject(new Error(`Failed to get user: ${getRequest.error?.message}`))
        }

        getRequest.onsuccess = () => {
          const user = getRequest.result
          console.log("📊 CURRENT USER DATA:", user)

          if (!user) {
            console.error("❌ USER NOT FOUND:", userId)
            reject(new Error(`User not found: ${userId}`))
            return
          }

          console.log(`💰 BALANCE UPDATE: ${user.balance || 0} → ${newBalance}`)

          // Create updated user object
          const updatedUser = {
            ...user,
            balance: newBalance,
            lastActive: new Date().toISOString(),
            balanceUpdatedAt: new Date().toISOString(),
          }

          console.log("📝 UPDATED USER OBJECT:", updatedUser)

          // Update the user
          const putRequest = store.put(updatedUser)

          putRequest.onerror = (event) => {
            console.error("❌ PUT USER ERROR:", event)
            reject(new Error(`Failed to update user: ${putRequest.error?.message}`))
          }

          putRequest.onsuccess = () => {
            console.log("✅ USER UPDATED IN DATABASE SUCCESSFULLY")

            // Transaction completed successfully
            transaction.oncomplete = () => {
              console.log("✅ TRANSACTION COMPLETED SUCCESSFULLY")
              resolve(updatedUser)
            }
          }
        }
      } catch (error) {
        console.error("❌ UNEXPECTED ERROR IN updateUserBalance:", error)
        reject(error)
      }
    })
  }

  // Item operations - FIXED VERSION
  async createItem(item: any): Promise<string> {
    this.ensureDB()

    return new Promise(async (resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["items", "priceHistory", "sellerInventory"], "readwrite")

        // Handle transaction errors
        transaction.onerror = () => {
          console.error("❌ Transaction failed:", transaction.error)
          reject(transaction.error)
        }

        transaction.onabort = () => {
          console.error("❌ Transaction aborted")
          reject(new Error("Transaction aborted"))
        }

        const itemStore = transaction.objectStore("items")
        const priceStore = transaction.objectStore("priceHistory")
        const sellerInventoryStore = transaction.objectStore("sellerInventory")

        const newItem = {
          ...item,
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          available: true,
          views: 0,
          inquiries: 0,
        }

        console.log("💾 Creating item:", newItem)

        // Add item
        const itemRequest = itemStore.add(newItem)
        itemRequest.onerror = () => {
          console.error("❌ Error adding item:", itemRequest.error)
          reject(itemRequest.error)
        }

        // Add to price history
        const priceEntry = {
          id: `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          itemId: newItem.id,
          itemName: newItem.name,
          sellerId: newItem.sellerId,
          price: newItem.price,
          timestamp: new Date().toISOString(),
          action: "listed",
        }

        const priceRequest = priceStore.add(priceEntry)
        priceRequest.onerror = () => {
          console.error("❌ Error adding price history:", priceRequest.error)
          reject(priceRequest.error)
        }

        // Add to seller inventory
        const sellerInventoryEntry = {
          id: `seller_inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sellerId: newItem.sellerId,
          itemId: newItem.id,
          itemName: newItem.name,
          quantity: newItem.quantity,
          pricePerUnit: newItem.price,
          totalValue: newItem.quantity * newItem.price,
          status: "listed",
          listedAt: new Date().toISOString(),
          views: 0,
          inquiries: 0,
        }

        const sellerInventoryRequest = sellerInventoryStore.add(sellerInventoryEntry)
        sellerInventoryRequest.onerror = () => {
          console.error("❌ Error adding seller inventory:", sellerInventoryRequest.error)
          reject(sellerInventoryRequest.error)
        }

        // Success handler
        transaction.oncomplete = () => {
          console.log("✅ Item created successfully:", newItem.id)
          resolve(newItem.id)
        }
      } catch (error) {
        console.error("❌ Error in createItem:", error)
        reject(error)
      }
    })
  }

  async getItems(filters?: any): Promise<any[]> {
    this.ensureDB()

    const transaction = this.db!.transaction(["items"], "readonly")
    const store = transaction.objectStore("items")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        let items = request.result || []

        // Apply filters
        if (filters) {
          if (filters.available !== undefined) {
            items = items.filter((item) => item.available === filters.available)
          }
          if (filters.sellerId) {
            items = items.filter((item) => item.sellerId === filters.sellerId)
          }
          if (filters.category) {
            items = items.filter((item) => item.category === filters.category)
          }
          if (filters.minPrice) {
            items = items.filter((item) => item.price >= filters.minPrice)
          }
          if (filters.maxPrice) {
            items = items.filter((item) => item.price <= filters.maxPrice)
          }
        }

        // Sort by most recent
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        resolve(items)
      }
      request.onerror = () => {
        console.error("❌ Error getting items:", request.error)
        reject(request.error)
      }
    })
  }

  async updateItem(id: string, updates: any): Promise<void> {
    this.ensureDB()

    return new Promise(async (resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["items", "priceHistory", "sellerInventory"], "readwrite")
        const itemStore = transaction.objectStore("items")
        const priceStore = transaction.objectStore("priceHistory")
        const sellerInventoryStore = transaction.objectStore("sellerInventory")

        const getRequest = itemStore.get(id)
        getRequest.onsuccess = () => {
          const item = getRequest.result
          if (!item) {
            reject(new Error("Item not found"))
            return
          }

          const updatedItem = {
            ...item,
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          const putRequest = itemStore.put(updatedItem)
          putRequest.onsuccess = () => {
            // Update seller inventory
            const sellerInventoryIndex = sellerInventoryStore.index("itemId")
            const sellerInventoryRequest = sellerInventoryIndex.get(id)

            sellerInventoryRequest.onsuccess = () => {
              const sellerInventory = sellerInventoryRequest.result
              if (sellerInventory) {
                const updatedSellerInventory = {
                  ...sellerInventory,
                  status: updates.available === false ? "sold" : sellerInventory.status,
                  updatedAt: new Date().toISOString(),
                }

                sellerInventoryStore.put(updatedSellerInventory)
              }
            }

            // Track price changes
            if (updates.price && updates.price !== item.price) {
              const priceEntry = {
                id: `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                itemId: id,
                itemName: item.name,
                sellerId: item.sellerId,
                price: updates.price,
                oldPrice: item.price,
                timestamp: new Date().toISOString(),
                action: "price_updated",
              }

              const priceRequest = priceStore.add(priceEntry)
              priceRequest.onsuccess = () => {
                console.log("✅ Item updated with price history:", id)
                resolve()
              }
              priceRequest.onerror = () => reject(priceRequest.error)
            } else {
              console.log("✅ Item updated:", id)
              resolve()
            }
          }
          putRequest.onerror = () => reject(putRequest.error)
        }
        getRequest.onerror = () => reject(getRequest.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Transaction operations with inventory updates
  async createTransaction(transactionData: any): Promise<string> {
    this.ensureDB()

    return new Promise(async (resolve, reject) => {
      try {
        const transaction = this.db!.transaction(
          ["transactions", "vendorInventory", "users", "sellerInventory"],
          "readwrite",
        )
        const transactionStore = transaction.objectStore("transactions")
        const vendorInventoryStore = transaction.objectStore("vendorInventory")
        const userStore = transaction.objectStore("users")
        const sellerInventoryStore = transaction.objectStore("sellerInventory")

        const newTransaction = {
          ...transactionData,
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          status: transactionData.status || "completed", // Default to completed
        }

        console.log("💳 Creating transaction:", newTransaction)

        const txnRequest = transactionStore.add(newTransaction)
        txnRequest.onerror = () => reject(txnRequest.error)

        // Add to vendor inventory
        const vendorInventoryEntry = {
          id: `vendor_inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          vendorId: newTransaction.buyerId,
          itemName: newTransaction.itemName,
          category: newTransaction.category || "Other",
          quantity: newTransaction.quantity,
          pricePerUnit: newTransaction.pricePerUnit,
          totalCost: newTransaction.totalAmount,
          purchasedAt: new Date().toISOString(),
          currentStock: newTransaction.quantity,
          status: "in_stock",
        }

        console.log("🏪 Adding to vendor inventory:", vendorInventoryEntry)

        const vendorInvRequest = vendorInventoryStore.add(vendorInventoryEntry)
        vendorInvRequest.onerror = () => reject(vendorInvRequest.error)

        // Update vendor balance
        const userRequest = userStore.get(newTransaction.buyerId)
        userRequest.onsuccess = () => {
          const vendor = userRequest.result
          if (vendor) {
            const updatedVendor = {
              ...vendor,
              balance: (vendor.balance || 0) - newTransaction.totalAmount,
              lastActive: new Date().toISOString(),
            }

            console.log(
              `💰 Updating vendor balance: ${vendor.balance} - ${newTransaction.totalAmount} = ${updatedVendor.balance}`,
            )

            const updateUserRequest = userStore.put(updatedVendor)
            updateUserRequest.onerror = () => reject(updateUserRequest.error)
          }
        }
        userRequest.onerror = () => reject(userRequest.error)

        // Update seller inventory status
        const sellerInventoryIndex = sellerInventoryStore.index("itemId")
        const sellerInventoryRequest = sellerInventoryIndex.get(newTransaction.itemId)

        sellerInventoryRequest.onsuccess = () => {
          const sellerInventory = sellerInventoryRequest.result
          if (sellerInventory) {
            const updatedSellerInventory = {
              ...sellerInventory,
              status: "sold",
              soldAt: new Date().toISOString(),
            }

            sellerInventoryStore.put(updatedSellerInventory)
            console.log("🛒 Updated seller inventory to sold")
          }
        }

        transaction.oncomplete = () => {
          console.log("✅ Transaction created successfully:", newTransaction.id)
          resolve(newTransaction.id)
        }

        transaction.onerror = () => reject(transaction.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getTransactions(filters?: any): Promise<any[]> {
    this.ensureDB()

    const transaction = this.db!.transaction(["transactions"], "readonly")
    const store = transaction.objectStore("transactions")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        let transactions = request.result || []

        if (filters) {
          if (filters.buyerId) {
            transactions = transactions.filter((t) => t.buyerId === filters.buyerId)
          }
          if (filters.sellerId) {
            transactions = transactions.filter((t) => t.sellerId === filters.sellerId)
          }
          if (filters.status) {
            transactions = transactions.filter((t) => t.status === filters.status)
          }
        }

        transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        resolve(transactions)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Vendor Inventory Operations
  async getVendorInventory(vendorId: string): Promise<any[]> {
    this.ensureDB()

    const transaction = this.db!.transaction(["vendorInventory"], "readonly")
    const store = transaction.objectStore("vendorInventory")
    const index = store.index("vendorId")

    return new Promise((resolve, reject) => {
      const request = index.getAll(vendorId)
      request.onsuccess = () => {
        const inventory = request.result.sort(
          (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
        )
        console.log(`🏪 Retrieved ${inventory.length} vendor inventory items for ${vendorId}`)
        resolve(inventory)
      }
      request.onerror = () => {
        console.error("❌ Error getting vendor inventory:", request.error)
        reject(request.error)
      }
    })
  }

  async updateVendorInventoryStock(inventoryId: string, newStock: number): Promise<void> {
    this.ensureDB()

    return new Promise(async (resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["vendorInventory"], "readwrite")
        const store = transaction.objectStore("vendorInventory")

        const getRequest = store.get(inventoryId)
        getRequest.onsuccess = () => {
          const inventory = getRequest.result
          if (!inventory) {
            reject(new Error("Inventory item not found"))
            return
          }

          const updatedInventory = {
            ...inventory,
            currentStock: newStock,
            status: newStock > 0 ? "in_stock" : "out_of_stock",
            lastUpdated: new Date().toISOString(),
          }

          const putRequest = store.put(updatedInventory)
          putRequest.onsuccess = () => {
            console.log("✅ Vendor inventory stock updated:", inventoryId)
            resolve()
          }
          putRequest.onerror = () => reject(putRequest.error)
        }
        getRequest.onerror = () => reject(getRequest.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Seller Inventory Operations
  async getSellerInventory(sellerId: string): Promise<any[]> {
    this.ensureDB()

    const transaction = this.db!.transaction(["sellerInventory"], "readonly")
    const store = transaction.objectStore("sellerInventory")
    const index = store.index("sellerId")

    return new Promise((resolve, reject) => {
      const request = index.getAll(sellerId)
      request.onsuccess = () => {
        const inventory = request.result.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime())
        console.log(`🛒 Retrieved ${inventory.length} seller inventory items for ${sellerId}`)
        resolve(inventory)
      }
      request.onerror = () => {
        console.error("❌ Error getting seller inventory:", request.error)
        reject(request.error)
      }
    })
  }

  // FIXED: Notification operations
  async addNotification(notification: any): Promise<string> {
    this.ensureDB()

    const transaction = this.db!.transaction(["notifications"], "readwrite")
    const store = transaction.objectStore("notifications")

    const newNotification = {
      ...notification,
      id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: notification.read || false,
    }

    return new Promise((resolve, reject) => {
      const request = store.add(newNotification)
      request.onsuccess = () => {
        console.log("🔔 Notification added successfully:", newNotification.id)
        resolve(newNotification.id)
      }
      request.onerror = () => {
        console.error("❌ Error adding notification:", request.error)
        reject(request.error)
      }
    })
  }

  async createNotification(notification: any): Promise<string> {
    return this.addNotification(notification)
  }

  async getNotifications(userId?: string): Promise<any[]> {
    this.ensureDB()

    const transaction = this.db!.transaction(["notifications"], "readonly")
    const store = transaction.objectStore("notifications")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        let notifications = request.result || []

        if (userId) {
          notifications = notifications.filter((n) => n.userId === userId || !n.userId) // Global notifications
        }

        notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        console.log(`🔔 Retrieved ${notifications.length} notifications for user ${userId}`)
        resolve(notifications)
      }
      request.onerror = () => {
        console.error("❌ Error getting notifications:", request.error)
        reject(request.error)
      }
    })
  }

  async getMarketAnalytics(): Promise<any> {
    this.ensureDB()

    try {
      const [items, transactions] = await Promise.all([this.getItems(), this.getTransactions()])

      // Calculate analytics from real data
      const analytics = {
        totalItems: items.length,
        availableItems: items.filter((item) => item.available).length,
        totalTransactions: transactions.length,
        completedTransactions: transactions.filter((t) => t.status === "completed").length,
        pendingTransactions: transactions.filter((t) => t.status === "pending").length,
        categoryDistribution: items.reduce((acc: any, item) => {
          const category = item.category || "Other"
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {}),
        averagePrice: items.length > 0 ? items.reduce((sum, item) => sum + item.price, 0) / items.length : 0,
        totalValue: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        topSellers: items.reduce((acc: any, item) => {
          const seller = item.sellerName || "Unknown"
          acc[seller] = (acc[seller] || 0) + 1
          return acc
        }, {}),
        recentActivity: transactions.slice(0, 10).map((t) => ({
          type: "transaction",
          item: t.itemName,
          amount: t.totalAmount,
          timestamp: t.createdAt,
        })),
      }

      console.log("📊 Generated market analytics:", analytics)
      return analytics
    } catch (error) {
      console.error("❌ Error generating market analytics:", error)
      return {
        totalItems: 0,
        availableItems: 0,
        totalTransactions: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        categoryDistribution: {},
        averagePrice: 0,
        totalValue: 0,
        topSellers: {},
        recentActivity: [],
      }
    }
  }

  // Database status
  getStatus(): any {
    return {
      initialized: !!this.db,
      dbName: this.dbName,
      version: this.version,
      stores: this.db ? Array.from(this.db.objectStoreNames) : [],
      timestamp: new Date().toISOString(),
    }
  }

  // CRITICAL FIX: Add method to list all users for debugging
  async getAllUsers(): Promise<any[]> {
    this.ensureDB()

    const transaction = this.db!.transaction(["users"], "readonly")
    const store = transaction.objectStore("users")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const users = request.result || []
        console.log("👥 All users in database:", users)
        resolve(users)
      }
      request.onerror = () => {
        console.error("❌ Error getting all users:", request.error)
        reject(request.error)
      }
    })
  }
}

export const database = new VendorSaathiDB()

// Initialize database on app start with proper error handling
if (typeof window !== "undefined") {
  database
    .init()
    .then(() => {
      console.log("✅ VendorSaathi IndexedDB initialized successfully")
      console.log("📊 Database status:", database.getStatus())
    })
    .catch((error) => {
      console.error("❌ IndexedDB initialization failed:", error)
      // Try to delete and recreate the database
      indexedDB
        .deleteDatabase("VendorSaathiDB")
        .then(() => {
          console.log("🔄 Deleted corrupted database, reinitializing...")
          return database.init()
        })
        .then(() => {
          console.log("✅ Database reinitialized successfully")
        })
        .catch((retryError) => {
          console.error("❌ Database reinitialization also failed:", retryError)
        })
    })
}
