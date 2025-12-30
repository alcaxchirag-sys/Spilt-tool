import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import PageTransition from "@/components/providers/PageTransition"
import BottomNav from "@/components/layout/BottomNav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SplitItUp Expense App",
  description: "Split expenses with friends and groups",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💸</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PageTransition>
          {children}
        </PageTransition>
        <BottomNav />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

