"use client"

import { createContext, useContext } from "react"

export interface User {
  id: string
  email: string
  name: string
  phone: string
  businessName: string
  type: "vendor" | "supplier" | "seller"
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  verified: boolean
  rating: number
  joinedAt: Date
  balance?: number
  lastActive?: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
  businessName: string
  address: string
  type: "vendor" | "supplier" | "seller"
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string, type: "vendor" | "supplier" | "seller") => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  setUser: (user: User) => void // Add setUser method
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Mock users for demo - these will be synced with database
export const mockUsers: User[] = [
  {
    id: "vendor_demo_123",
    email: "vendor@demo.com",
    name: "Demo Vendor",
    phone: "+91 98765 43210",
    businessName: "Demo Vendor Store",
    type: "vendor",
    location: {
      address: "123 Market Street, Delhi",
      coordinates: { lat: 28.6139, lng: 77.209 },
    },
    verified: true,
    rating: 4.5,
    joinedAt: new Date(),
    balance: 50000,
  },
  {
    id: "seller_demo_456",
    email: "seller@demo.com",
    name: "Demo Seller",
    phone: "+91 98765 43211",
    businessName: "Demo Farm",
    type: "seller",
    location: {
      address: "456 Farm Road, Delhi",
      coordinates: { lat: 28.6239, lng: 77.219 },
    },
    verified: true,
    rating: 4.8,
    joinedAt: new Date(),
    balance: 0,
  },
  {
    id: "supplier_demo_789",
    email: "supplier@demo.com",
    name: "Demo Supplier",
    phone: "+91 98765 43212",
    businessName: "Demo Supply Co",
    type: "supplier",
    location: {
      address: "789 Supply Lane, Delhi",
      coordinates: { lat: 28.6339, lng: 77.229 },
    },
    verified: true,
    rating: 4.3,
    joinedAt: new Date(),
    balance: 0,
  },
]
