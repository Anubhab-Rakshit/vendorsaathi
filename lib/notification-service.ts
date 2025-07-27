"use client"

import { database } from "./database"
import { realtimeService } from "./realtime-service"

interface NotificationRule {
  trigger: string
  targetRole: string[]
  excludeRole?: string[]
  template: (data: any) => { title: string; message: string; priority: "high" | "medium" | "low" }
}

class RoleBasedNotificationService {
  private rules: NotificationRule[] = [
    // Vendor purchases item -> Notify Seller only
    {
      trigger: "purchase_request",
      targetRole: ["seller"],
      excludeRole: ["vendor", "supplier"],
      template: (data) => ({
        title: "🛒 New Purchase Request",
        message: `${data.buyerName} wants to buy ${data.itemName} for ₹${data.amount}`,
        priority: "high",
      }),
    },

    // Purchase completed -> Notify Seller only
    {
      trigger: "purchase_completed",
      targetRole: ["seller"],
      excludeRole: ["vendor", "supplier"],
      template: (data) => ({
        title: "✅ Item Sold!",
        message: `Your ${data.itemName} was purchased by ${data.buyerName} for ₹${data.amount}`,
        priority: "high",
      }),
    },

    // Seller lists item -> Notify Vendors only
    {
      trigger: "item_listed",
      targetRole: ["vendor"],
      excludeRole: ["seller", "supplier"],
      template: (data) => ({
        title: "🆕 New Item Available",
        message: `${data.sellerName} listed ${data.itemName} for ₹${data.price}/${data.unit}`,
        priority: "medium",
      }),
    },

    // Supplier lists bulk item -> Notify Vendors only
    {
      trigger: "bulk_item_listed",
      targetRole: ["vendor"],
      excludeRole: ["seller", "supplier"],
      template: (data) => ({
        title: "📦 Bulk Item Available",
        message: `${data.supplierName} has ${data.itemName} in bulk - ₹${data.price}/${data.unit}`,
        priority: "medium",
      }),
    },

    // Price drop -> Notify Vendors only
    {
      trigger: "price_drop",
      targetRole: ["vendor"],
      excludeRole: ["seller", "supplier"],
      template: (data) => ({
        title: "💰 Price Drop Alert",
        message: `${data.itemName} price dropped to ₹${data.newPrice}/${data.unit} (was ₹${data.oldPrice})`,
        priority: "medium",
      }),
    },
  ]

  async sendNotification(trigger: string, data: any): Promise<void> {
    console.log(`🔔 Sending notification for trigger: ${trigger}`, data)

    const rule = this.rules.find((r) => r.trigger === trigger)
    if (!rule) {
      console.warn(`⚠️ No notification rule found for trigger: ${trigger}`)
      return
    }

    try {
      // Get all users from database
      const allUsers = await this.getAllUsers()
      console.log(`👥 Found ${allUsers.length} total users`)

      // Filter users based on role rules
      const targetUsers = allUsers.filter((user) => {
        const userRole = user.type || user.userType
        const shouldInclude = rule.targetRole.includes(userRole)
        const shouldExclude = rule.excludeRole?.includes(userRole) || false
        const isNotExcludedUser = !data.excludeUserId || user.id !== data.excludeUserId

        const result = shouldInclude && !shouldExclude && isNotExcludedUser

        console.log(
          `👤 User ${user.name} (${userRole}): include=${shouldInclude}, exclude=${shouldExclude}, notSelf=${isNotExcludedUser}, final=${result}`,
        )

        return result
      })

      console.log(`🎯 Filtered to ${targetUsers.length} target users for ${trigger}`)

      if (targetUsers.length === 0) {
        console.warn(`⚠️ No target users found for trigger: ${trigger}`)
        return
      }

      // Generate notification content
      const notificationContent = rule.template(data)

      // Send to each target user
      for (const user of targetUsers) {
        await database.createNotification({
          userId: user.id,
          type: trigger,
          title: notificationContent.title,
          message: notificationContent.message,
          priority: notificationContent.priority,
          data: data,
        })

        console.log(`✅ Notification sent to ${user.name} (${user.type}): ${notificationContent.title}`)
      }

      // Emit real-time notification
      realtimeService.emit("notification", {
        trigger,
        data,
        targetUsers: targetUsers.map((u) => u.id),
        content: notificationContent,
      })

      console.log(`🚀 Real-time notification emitted for ${targetUsers.length} users`)
    } catch (error) {
      console.error("❌ Error sending notification:", error)
    }
  }

  private async getAllUsers(): Promise<any[]> {
    try {
      // Access the database instance directly
      const dbInstance = database as any
      if (!dbInstance.db) {
        console.error("❌ Database not initialized")
        return []
      }

      const transaction = dbInstance.db.transaction(["users"], "readonly")
      const store = transaction.objectStore("users")

      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const users = request.result || []
          console.log(`📊 Retrieved ${users.length} users from database`)
          resolve(users)
        }
        request.onerror = () => {
          console.error("❌ Error getting users:", request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error("❌ Error in getAllUsers:", error)
      return []
    }
  }

  // Convenience methods for common notifications
  async notifyPurchaseRequest(buyerId: string, sellerId: string, itemData: any): Promise<void> {
    console.log(`🛒 Notifying purchase request: buyer=${buyerId}, seller=${sellerId}`)

    const buyer = await database.getUser(buyerId)
    await this.sendNotification("purchase_request", {
      buyerId,
      buyerName: buyer?.name || "Unknown Buyer",
      sellerId,
      itemName: itemData.name,
      amount: itemData.price * (itemData.requestedQuantity || 1),
      excludeUserId: buyerId, // Don't notify the buyer
    })
  }

  async notifyPurchaseCompleted(buyerId: string, sellerId: string, itemData: any): Promise<void> {
    console.log(`✅ Notifying purchase completed: buyer=${buyerId}, seller=${sellerId}`)

    const buyer = await database.getUser(buyerId)
    await this.sendNotification("purchase_completed", {
      buyerId,
      buyerName: buyer?.name || "Unknown Buyer",
      sellerId,
      itemName: itemData.name,
      amount: itemData.totalAmount || itemData.price,
      excludeUserId: buyerId, // Don't notify the buyer
    })
  }

  async notifyItemListed(sellerId: string, itemData: any): Promise<void> {
    console.log(`🆕 Notifying item listed: seller=${sellerId}`)

    const seller = await database.getUser(sellerId)
    const trigger = seller?.type === "supplier" ? "bulk_item_listed" : "item_listed"

    await this.sendNotification(trigger, {
      sellerId,
      sellerName: seller?.name || "Unknown Seller",
      supplierName: seller?.name || "Unknown Supplier",
      itemName: itemData.name,
      price: itemData.price,
      unit: itemData.unit,
      category: itemData.category,
      excludeUserId: sellerId, // Don't notify the seller
    })
  }

  async notifyPriceDrop(itemData: any, oldPrice: number): Promise<void> {
    console.log(`💰 Notifying price drop for ${itemData.name}`)

    await this.sendNotification("price_drop", {
      itemName: itemData.name,
      newPrice: itemData.price,
      oldPrice,
      unit: itemData.unit,
      sellerId: itemData.sellerId,
      excludeUserId: itemData.sellerId, // Don't notify the seller
    })
  }
}

export const notificationService = new RoleBasedNotificationService()
