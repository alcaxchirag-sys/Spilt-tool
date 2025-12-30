"use client"

import { Loader2 } from "lucide-react"
import { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean
    loadingText?: string
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
}

export default function LoadingButton({
    children,
    isLoading = false,
    loadingText,
    className,
    variant = "primary",
    disabled,
    ...props
}: LoadingButtonProps) {
    const baseStyles = "flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
        primary: "gradient-button text-white shadow-lg hover:shadow-xl focus:ring-purple-500",
        secondary: "bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-500",
        outline: "border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-700 focus:ring-purple-500",
        ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
    }

    return (
        <button
            className={cn(baseStyles, variants[variant], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading && loadingText ? loadingText : children}
        </button>
    )
}
