export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="relative mb-4">
                <div className="h-16 w-16 rounded-full border-4 border-purple-200"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-purple-600 animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                SplitItUp
            </h2>
            <p className="text-gray-500 mt-2 animate-pulse">Loading...</p>
        </div>
    )
}
