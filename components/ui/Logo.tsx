"use client"

import { motion } from "framer-motion"

interface LogoProps {
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
    showText?: boolean
    animated?: boolean
}

export default function Logo({
    size = "md",
    className = "",
    showText = true,
    animated = true
}: LogoProps) {
    const sizes = {
        sm: "text-2xl",
        md: "text-4xl",
        lg: "text-5xl",
        xl: "text-7xl"
    }

    const textSizes = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-3xl",
        xl: "text-5xl"
    }

    const emoji = "💸"

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <motion.div
                initial={animated ? { scale: 0.8, opacity: 0 } : {}}
                animate={animated ? { scale: 1, opacity: 1 } : {}}
                whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
                className={`${sizes[size]} leading-none select-none`}
            >
                {emoji}
            </motion.div>
            {showText && (
                <motion.span
                    initial={animated ? { x: -10, opacity: 0 } : {}}
                    animate={animated ? { x: 0, opacity: 1 } : {}}
                    className={`${textSizes[size]} font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent tracking-tight`}
                >
                    SplitItUp
                </motion.span>
            )}
        </div>
    )
}
