"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface SocketContextType {
  socket: any | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export function Providers({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<any | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate socket connection for demo purposes
    // In production, you would use actual socket.io
    const mockSocket = {
      on: (event: string, callback: Function) => {
        // Mock event listeners
        console.log(`Mock socket listening for: ${event}`)
      },
      off: (event: string) => {
        console.log(`Mock socket stopped listening for: ${event}`)
      },
      emit: (event: string, data: any) => {
        console.log(`Mock socket emitting: ${event}`, data)
      },
      disconnect: () => {
        console.log("Mock socket disconnected")
        setIsConnected(false)
      },
    }

    // Simulate connection after a short delay
    const connectionTimer = setTimeout(() => {
      setSocket(mockSocket)
      setIsConnected(true)
      console.log("🔗 Mock real-time connection established")
    }, 1000)

    return () => {
      clearTimeout(connectionTimer)
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}
