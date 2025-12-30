"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, PlusCircle, User } from "lucide-react"
import { motion } from "framer-motion"

export default function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/groups", label: "Groups", icon: Users },
        { href: "/groups/create", label: "Create", icon: PlusCircle },
        { href: "/profile", label: "Profile", icon: User },
    ]

    // Hide bottom nav on auth pages
    if (pathname === "/login" || pathname === "/signup") {
        return null
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-full h-full space-y-1"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-[1px] w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-b-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div
                                className={`transition-colors duration-200 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span
                                className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
