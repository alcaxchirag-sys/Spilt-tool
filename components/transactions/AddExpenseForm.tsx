"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createTransaction } from "@/lib/transaction-actions"
import toast from "react-hot-toast"
import LoadingButton from "@/components/ui/LoadingButton"
import { ArrowLeft, Receipt, DollarSign, FileText } from "lucide-react"

interface Member {
    userId: string
    user: {
        id: string
        username: string
        name: string
    }
}

interface AddExpenseFormProps {
    groupId: string
    groupName: string
    members: Member[]
}

export default function AddExpenseForm({ groupId, groupName, members }: AddExpenseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [splitType, setSplitType] = useState<"equal" | "custom">("equal")
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        notes: "",
    })
    const [customSplits, setCustomSplits] = useState<Record<string, number>>(
        members.reduce((acc, member) => ({ ...acc, [member.userId]: 0 }), {})
    )

    const totalAmount = parseFloat(formData.amount) || 0
    const equalSplitAmount = members.length > 0 ? totalAmount / members.length : 0
    const customSplitTotal = Object.values(customSplits).reduce((sum, val) => sum + val, 0)
    const splitDifference = Math.abs(customSplitTotal - totalAmount)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (totalAmount <= 0) {
            toast.error("Amount must be greater than 0")
            return
        }

        if (splitType === "custom" && splitDifference >= 0.01) {
            toast.error("Split amounts must equal the total amount")
            return
        }

        setLoading(true)

        try {
            const formDataObj = new FormData()
            formDataObj.append("groupId", groupId)
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
                router.push(`/groups/${groupId}`)
                router.refresh()
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-card rounded-xl p-8 shadow-lg border border-purple-100 space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Add Expense
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{groupName}</p>
                </div>
                <div className="w-10" />
            </div>

            <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Main Details */}
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Receipt size={16} className="mr-2 text-purple-500" />
                            Expense Title <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="What was it for?"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <DollarSign size={16} className="mr-2 text-green-500" />
                                Amount <span className="text-red-500 ml-1">*</span>
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
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FileText size={16} className="mr-2 text-blue-500" />
                                Category
                            </label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                placeholder="Food, Travel, etc."
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
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all"
                            placeholder="Any extra details..."
                        />
                    </div>
                </div>

                {/* Split Details */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        How to split?
                    </label>
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => setSplitType("equal")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${splitType === "equal"
                                ? "bg-white dark:bg-gray-800 text-purple-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Equally
                        </button>
                        <button
                            type="button"
                            onClick={() => setSplitType("custom")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${splitType === "custom"
                                ? "bg-white dark:bg-gray-800 text-purple-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Custom
                        </button>
                    </div>

                    {splitType === "equal" ? (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Each person pays</span>
                                <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                                    ${equalSplitAmount.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Split among all {members.length} members
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {members.map((member) => (
                                <div key={member.userId} className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                        {member.user.name}
                                    </span>
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={customSplits[member.userId] || ""}
                                            onChange={(e) => {
                                                setCustomSplits({
                                                    ...customSplits,
                                                    [member.userId]: parseFloat(e.target.value) || 0,
                                                })
                                            }}
                                            className="w-full pl-6 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Split:</span>
                                    <span
                                        className={`text-sm font-bold ${splitDifference < 0.01 ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        ${customSplitTotal.toFixed(2)} / ${totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </form>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
                <LoadingButton
                    type="submit"
                    form="transaction-form"
                    isLoading={loading}
                    loadingText="Adding..."
                    disabled={splitType === "custom" && splitDifference >= 0.01}
                    className="flex-1 py-3"
                >
                    Add Expense
                </LoadingButton>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-medium dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                    Cancel
                </button>
            </div>
        </motion.div>
    )
}
