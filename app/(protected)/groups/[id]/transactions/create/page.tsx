"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createTransaction } from "@/lib/transaction-actions"
import toast from "react-hot-toast"
import LoadingButton from "@/components/ui/LoadingButton"
import { ArrowLeft } from "lucide-react"

interface Member {
    id: string
    userId: string
    user: {
        id: string
        username: string
        name: string
    }
}

interface CreateTransactionPageProps {
    params: {
        id: string
    }
}

export default function CreateTransactionPage({ params }: CreateTransactionPageProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<Member[]>([])
    const [splitType, setSplitType] = useState<"equal" | "custom">("equal")
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        notes: "",
    })
    const [customSplits, setCustomSplits] = useState<Record<string, number>>({})

    useEffect(() => {
        // Fetch group members
        const fetchMembers = async () => {
            try {
                const response = await fetch(`/api/groups/${params.id}/members`)
                if (response.ok) {
                    const data = await response.json()
                    setMembers(data)

                    // Initialize custom splits
                    const initialSplits: Record<string, number> = {}
                    data.forEach((member: Member) => {
                        initialSplits[member.userId] = 0
                    })
                    setCustomSplits(initialSplits)
                }
            } catch (error) {
                console.error("Failed to fetch members", error)
                toast.error("Failed to load group members")
            }
        }

        fetchMembers()
    }, [params.id])

    const totalAmount = parseFloat(formData.amount) || 0
    const equalSplitAmount = members.length > 0 ? totalAmount / members.length : 0
    const customSplitTotal = Object.values(customSplits).reduce((sum, val) => sum + val, 0)
    const splitDifference = Math.abs(customSplitTotal - totalAmount)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formDataObj = new FormData()
            formDataObj.append("groupId", params.id)
            formDataObj.append("title", formData.title)
            formDataObj.append("amount", formData.amount)
            formDataObj.append("category", formData.category)
            formDataObj.append("notes", formData.notes)
            formDataObj.append("splitType", splitType)

            if (splitType === "custom") {
                const splits = Object.entries(customSplits).map(([userId, amount]) => ({
                    userId,
                    amount,
                }))
                formDataObj.append("customSplits", JSON.stringify(splits))
            }

            const result = await createTransaction(formDataObj)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Expense added successfully!")
                router.push(`/groups/${params.id}`)
                router.refresh()
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header with Back Button and Title */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Expense</h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Expense Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                placeholder="e.g., Dinner at restaurant"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="e.g., Food, Travel"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all"
                                placeholder="Add any additional notes..."
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Split Type
                            </label>
                            <div className="flex space-x-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setSplitType("equal")}
                                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${splitType === "equal"
                                        ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300"
                                        }`}
                                >
                                    Equal Split
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSplitType("custom")}
                                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${splitType === "custom"
                                        ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300"
                                        }`}
                                >
                                    Custom Split
                                </button>
                            </div>

                            {splitType === "equal" ? (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        Each person pays: <span className="font-bold text-purple-700 dark:text-purple-400">${equalSplitAmount.toFixed(2)}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Split equally among {members.length} members
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {members.map((member) => (
                                        <div key={member.userId} className="flex items-center space-x-3">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {member.user.name}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={customSplits[member.userId] || 0}
                                                    onChange={(e) => {
                                                        setCustomSplits({
                                                            ...customSplits,
                                                            [member.userId]: parseFloat(e.target.value) || 0,
                                                        })
                                                    }}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                            <span
                                                className={`font-semibold ${splitDifference < 0.01 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                    }`}
                                            >
                                                ${customSplitTotal.toFixed(2)} / ${totalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                        {splitDifference >= 0.01 && (
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                Split amounts must equal the total amount
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {/* Floating Submit Button (Top Right on Desktop, Fixed Bottom on Mobile) */}
                <div className="fixed top-20 right-4 z-40 hidden md:block">
                    <LoadingButton
                        type="submit"
                        form="transaction-form"
                        isLoading={loading}
                        loadingText="Adding..."
                        disabled={splitType === "custom" && splitDifference >= 0.01}
                        className="shadow-lg"
                    >
                        Add Expense
                    </LoadingButton>
                </div>

                {/* Mobile Sticky Footer */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-40">
                    <LoadingButton
                        type="submit"
                        form="transaction-form"
                        isLoading={loading}
                        loadingText="Adding..."
                        disabled={splitType === "custom" && splitDifference >= 0.01}
                        className="w-full py-3 shadow-lg"
                    >
                        Add Expense
                    </LoadingButton>
                </div>
            </motion.div>
        </div>
    )
}
