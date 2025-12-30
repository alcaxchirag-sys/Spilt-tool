"use client"

import { useEffect } from "react"
import LoadingButton from "@/components/ui/LoadingButton"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <LoadingButton onClick={() => reset()} className="px-8">
                Try again
            </LoadingButton>
        </div>
    )
}
