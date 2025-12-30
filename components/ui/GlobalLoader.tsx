"use client"

import { motion } from "framer-motion"

interface GlobalLoaderProps {
    fullScreen?: boolean
    text?: string
}

export default function GlobalLoader({ fullScreen = true, text = "Loading..." }: GlobalLoaderProps) {
    const content = (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative mb-8">
                {/* Soft gradient trail */}
                <div className="absolute inset-0 bg-purple-400/30 blur-xl rounded-full animate-pulse-soft" />

                {/* Bouncing Emoji */}
                <div className="text-6xl animate-bounce-horizontal relative z-10">
                    💸
                </div>
            </div>

            {/* Loading Text */}
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse-soft">
                {text}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
                Crunching the numbers...
            </p>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                {content}
            </div>
        )
    }

    return content
}
