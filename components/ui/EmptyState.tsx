"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
    className?: string
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    className = ""
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`gradient-card rounded-[2.5rem] p-12 text-center border border-white/10 shadow-2xl ${className}`}
        >
            <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-xl border border-white/10">
                    <Icon className="text-violet-600 dark:text-violet-400" size={40} />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="gradient-button text-white px-10 py-4 rounded-2xl font-bold inline-block shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {actionLabel}
                </Link>
            )}
        </motion.div>
    )
}
