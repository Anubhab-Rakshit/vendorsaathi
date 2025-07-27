import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins, Noto_Sans_Devanagari } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { AuthProvider } from "@/components/auth/auth-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})

const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["devanagari"],
  variable: "--font-hindi",
  display: "swap",
})

export const metadata: Metadata = {
  title: "VendorSaathi | AI-Powered Street Food Revolution",
  description:
    "Revolutionary AI platform connecting street food vendors with smart sourcing, real-time inventory sharing, and intelligent group buying",
  keywords: "street food, vendors, AI, sourcing, India, marketplace, real-time, smart buying",
  authors: [{ name: "VendorSaathi Team" }],
  openGraph: {
    title: "VendorSaathi - Street Food Revolution",
    description: "AI-powered platform for street food vendors",
    images: ["/og-image.jpg"],
  },
    generator: 'Anubhab Rakshit'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${notoSansDevanagari.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <AuthProvider>
          <Providers>
            <div className="min-h-screen relative">{children}</div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
