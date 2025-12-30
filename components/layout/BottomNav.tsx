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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe">
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
                                    className="absolute -top-[1px] w-12 h-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-b-full shadow-[0_2px_10px_rgba(124,58,237,0.3)]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div
                                className={`transition-all duration-300 ${isActive ? "text-violet-600 dark:text-violet-400 scale-110" : "text-slate-400 dark:text-slate-500"
                                    }`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span
                                className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
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
