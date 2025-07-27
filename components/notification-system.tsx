"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/database"
import { realtimeService } from "@/lib/realtime-service"
import { useAuth } from "@/lib/auth"
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  Package,
  ShoppingCart,
  TrendingDown,
  Users,
  Clock,
  X,
  RefreshCw,
  Plus,
} from "lucide-react"

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  priority: "high" | "medium" | "low"
  read: boolean
  timestamp: string
  data?: any
}

export default function NotificationSystem() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()

      // Listen for real-time notifications
      const unsubscribe = realtimeService.on("notification", (data) => {
        console.log("🔔 Real-time notification received:", data)
        loadNotifications() // Refresh notifications
      })

      return () => unsubscribe()
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log(`🔔 Loading notifications for user: ${user.id} (${user.type})`)

      const notificationData = await database.getNotifications(user.id)
      console.log(`📨 Raw notification data:`, notificationData)

      setNotifications(notificationData)
      setUnreadCount(notificationData.filter((n) => !n.read).length)

      console.log(
        `✅ Loaded ${notificationData.length} notifications, ${notificationData.filter((n) => !n.read).length} unread`,
      )
    } catch (error) {
      console.error("❌ Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const addTestNotification = async () => {
    if (!user) return

    try {
      const testNotification = {
        id: `test-${Date.now()}`,
        userId: user.id,
        type: "test",
        title: "Test Notification",
        message: "This is a test notification to verify the system is working!",
        priority: "medium" as const,
        read: false,
        timestamp: new Date().toISOString(),
      }

      // Add to database
      await database.addNotification(testNotification)

      // Refresh notifications
      await loadNotifications()

      console.log("✅ Test notification added successfully")
    } catch (error) {
      console.error("❌ Error adding test notification:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Update in database (you'd need to implement this method)
      // For now, just update locally
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("❌ Error marking notification as read:", error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      // In a real app, you'd implement a clearNotifications method in database
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error("❌ Error clearing notifications:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "purchase_request":
      case "purchase_completed":
        return <ShoppingCart className="w-5 h-5 text-green-500" />
      case "item_listed":
      case "bulk_item_listed":
        return <Package className="w-5 h-5 text-blue-500" />
      case "price_drop":
        return <TrendingDown className="w-5 h-5 text-orange-500" />
      case "group_order_ready":
        return <Users className="w-5 h-5 text-purple-500" />
      case "test":
        return <AlertCircle className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please login to view notifications.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-600">Stay updated with your marketplace activity</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              👤 <strong>{user?.name || user?.email || "User"}</strong> ({user?.type || "Unknown"})
            </p>
          </div>
          <Button
            onClick={addTestNotification}
            variant="outline"
            size="sm"
            className="bg-purple-50 hover:bg-purple-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Test Notification
          </Button>
          <Button onClick={loadNotifications} variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <BellRing className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notifications.filter((n) => n.priority === "high").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex justify-between items-center">
          <Badge className="bg-blue-100 text-blue-800">{notifications.length} total notifications</Badge>
          <Button
            onClick={clearAllNotifications}
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 bg-transparent"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}

      {/* Debug Info */}
      <Card className="glass-card bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Found {notifications.length} notifications for {user?.type || "unknown"}{" "}
            {user?.id || "unknown"}
          </p>
          {notifications.length === 0 && (
            <p className="text-sm text-blue-600 mt-2">
              💡 Click "Test Notification" to add a sample notification and verify the system works!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Notifications</h3>
            <p className="text-gray-600 mb-4">You're all caught up! New notifications will appear here.</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Vendors get notified when sellers list new items</p>
              <p>• Sellers get notified when vendors purchase their items</p>
              <p>• Everyone gets price drop alerts and group order updates</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`glass-card transition-all duration-200 ${
                !notification.read ? "ring-2 ring-blue-200 bg-blue-50" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">{notification.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(notification.priority)}>{notification.priority}</Badge>
                        {!notification.read && <Badge className="bg-blue-100 text-blue-800">New</Badge>}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{notification.message}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(notification.timestamp)}</span>
                        <span>•</span>
                        <span className="capitalize">{notification.type.replace("_", " ")}</span>
                      </div>

                      {!notification.read && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
