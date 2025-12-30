"use client"

import { motion } from "framer-motion"

interface GlobalLoaderProps {
    fullScreen?: boolean
    text?: string
}

import Logo from "./Logo"

export default function GlobalLoader({ fullScreen = true, text = "Loading..." }: GlobalLoaderProps) {
    const content = (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative mb-10">
                {/* Soft gradient trail */}
                <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full animate-pulse" />

                {/* Animated Logo */}
                <Logo size="xl" showText={false} animated={true} />
            </div>

            {/* Loading Text */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                {text}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Crunching the numbers...
            </p>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl">
                {content}
            </div>
        )
    }

    return content
}
