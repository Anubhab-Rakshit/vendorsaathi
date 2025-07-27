"use client"

import { useState, useEffect, type ReactNode } from "react"
import { AuthContext, type User, type RegisterData, mockUsers } from "@/lib/auth"
import { database } from "@/lib/database"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem("vendorsaathi_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("🔄 Restoring user from localStorage:", parsedUser)

        // CRITICAL FIX: Verify user exists in database and sync data
        verifyAndSyncUser(parsedUser)
      } catch (error) {
        console.error("❌ Error parsing stored user:", error)
        localStorage.removeItem("vendorsaathi_user")
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  // CRITICAL FIX: Verify user exists in database and sync data
  const verifyAndSyncUser = async (storedUser: User) => {
    try {
      console.log("🔍 Verifying user in database:", storedUser.id)

      // Try to get user from database
      const dbUser = await database.getUser(storedUser.id)

      if (dbUser) {
        console.log("✅ User found in database:", dbUser)

        // Use database user data (most up-to-date)
        const syncedUser = {
          ...dbUser,
          type: dbUser.userType || dbUser.type, // Handle both field names
        }

        setUser(syncedUser)

        // Update localStorage with synced data
        localStorage.setItem("vendorsaathi_user", JSON.stringify(syncedUser))
        console.log("✅ User synced successfully:", syncedUser)
      } else {
        console.log("⚠️ User not found in database, checking by email...")

        // Try to find by email
        const emailUser = await database.getUserByEmail(storedUser.email)

        if (emailUser) {
          console.log("✅ Found user by email:", emailUser)

          const syncedUser = {
            ...emailUser,
            type: emailUser.userType || emailUser.type,
          }

          setUser(syncedUser)
          localStorage.setItem("vendorsaathi_user", JSON.stringify(syncedUser))
          console.log("✅ User synced by email:", syncedUser)
        } else {
          console.log("❌ User not found anywhere, clearing session")
          localStorage.removeItem("vendorsaathi_user")
          setUser(null)
        }
      }
    } catch (error) {
      console.error("❌ Error verifying user:", error)
      // Keep the stored user but log the issue
      setUser(storedUser)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, type: "vendor" | "supplier" | "seller") => {
    setLoading(true)

    try {
      console.log(`🔐 Attempting login: ${email} as ${type}`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // First check database for existing user
      let foundUser = null

      try {
        const dbUser = await database.getUserByEmail(email)
        if (dbUser && (dbUser.type === type || dbUser.userType === type)) {
          foundUser = {
            ...dbUser,
            type: type, // Ensure type is correctly set
          }
          console.log("✅ Found user in database:", foundUser)
        }
      } catch (error) {
        console.log("ℹ️ User not found in database, checking mock users")
      }

      // If not found in database, check mock users
      if (!foundUser) {
        foundUser = mockUsers.find((u) => u.email === email && u.type === type)
        if (foundUser) {
          console.log("✅ Found user in mock data:", foundUser)

          // Store mock user in database for future use
          try {
            const dbUserId = await database.createUser({
              ...foundUser,
              password: password,
              userType: type,
            })

            // Update the user with database ID
            foundUser = {
              ...foundUser,
              id: dbUserId,
            }

            console.log("✅ Mock user stored in database with ID:", dbUserId)
          } catch (dbError) {
            console.log("ℹ️ Could not store in database, using mock user")
          }
        }
      }

      if (foundUser) {
        // Store user with correct type and ensure all fields are present
        const userToStore = {
          ...foundUser,
          type: type,
          balance: foundUser.balance || (type === "vendor" ? 50000 : 0),
          lastActive: new Date().toISOString(),
        }

        setUser(userToStore)
        localStorage.setItem("vendorsaathi_user", JSON.stringify(userToStore))
        console.log("✅ Login successful with synced user:", userToStore)
      } else {
        throw new Error("Invalid credentials or user type mismatch")
      }
    } catch (error) {
      console.error("❌ Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)

    try {
      console.log("📝 Registering new user:", userData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create new user with proper structure
      const newUser: User = {
        id: `${userData.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        businessName: userData.businessName,
        type: userData.type,
        location: {
          address: userData.address,
          coordinates: {
            lat: 28.6139 + Math.random() * 0.1,
            lng: 77.209 + Math.random() * 0.1,
          },
        },
        verified: false,
        rating: 0,
        joinedAt: new Date(),
        balance: userData.type === "vendor" ? 50000 : 0, // Initial balance for vendors
      }

      console.log("👤 Created user object:", newUser)

      // Store in database FIRST
      try {
        const dbUserId = await database.createUser({
          ...newUser,
          password: userData.password,
          userType: userData.type,
        })

        // Update user with database ID
        newUser.id = dbUserId
        console.log("✅ User stored in database with ID:", dbUserId)
      } catch (dbError) {
        console.error("❌ Database storage failed:", dbError)
        throw new Error("Failed to create user account. Please try again.")
      }

      // Add to mock users for immediate availability
      mockUsers.push(newUser)

      // Set as current user
      setUser(newUser)
      localStorage.setItem("vendorsaathi_user", JSON.stringify(newUser))
      console.log("✅ Registration successful:", newUser)
    } catch (error) {
      console.error("❌ Registration failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("vendorsaathi_user")
    console.log("✅ User logged out")
  }

  // CRITICAL FIX: Add updateUser method for balance updates
  const updateUser = (updatedUser: User) => {
    console.log("🔄 Updating user context:", updatedUser)
    setUser(updatedUser)
    localStorage.setItem("vendorsaathi_user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        setUser: updateUser, // Expose updateUser as setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
