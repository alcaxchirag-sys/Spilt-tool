"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { createTransaction, updateTransaction } from "@/lib/transaction-actions"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"
import LoadingButton from "@/components/ui/LoadingButton"

interface Member {
  id: string
  userId: string
  user: {
    id: string
    username: string
    name: string
  }
}

interface Transaction {
  id: string
  title: string
  amount: number
  category: string | null
  notes: string | null
  splits: Array<{
    userId: string
    amount: number
    user: {
      id: string
      username: string
      name: string
    }
  }>
}

interface AddTransactionModalProps {
  groupId: string
  transaction?: Transaction
  members?: Member[]
  onClose: () => void
  onSuccess: () => void
}

export default function AddTransactionModal({
  groupId,
  transaction,
  members = [],
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [splitType, setSplitType] = useState<"equal" | "custom">(
    transaction?.splits.length === members.length ? "equal" : "custom"
  )
  const [formData, setFormData] = useState({
    title: transaction?.title || "",
    amount: transaction?.amount.toString() || "",
    category: transaction?.category || "",
    notes: transaction?.notes || "",
  })

  const [customSplits, setCustomSplits] = useState<Record<string, number>>(() => {
    if (transaction && transaction.splits) {
      const splits: Record<string, number> = {}
      transaction.splits.forEach((split) => {
        splits[split.userId] = split.amount
      })
      return splits
    }
    const splits: Record<string, number> = {}
    members.forEach((member) => {
      splits[member.userId] = 0
    })
    return splits
  })

  const totalAmount = parseFloat(formData.amount) || 0
  const equalSplitAmount = members.length > 0 ? totalAmount / members.length : 0
  const customSplitTotal = Object.values(customSplits).reduce((sum, val) => sum + val, 0)
  const splitDifference = Math.abs(customSplitTotal - totalAmount)

  useEffect(() => {
    if (splitType === "equal" && members.length > 0) {
      const splits: Record<string, number> = {}
      members.forEach((member) => {
        splits[member.userId] = equalSplitAmount
      })
      setCustomSplits(splits)
    }
  }, [splitType, totalAmount, members, equalSplitAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      const result = transaction
        ? await updateTransaction(transaction.id, formDataObj)
        : await createTransaction(formDataObj)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(transaction ? "Transaction updated!" : "Expense added!")
        onSuccess()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {transaction ? "Edit Expense" : "Add Expense"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g., Dinner at restaurant"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="e.g., Food, Travel"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                placeholder="Add any additional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split Type
              </label>
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${splitType === "equal"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-300 text-gray-700 hover:border-purple-300"
                    }`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("custom")}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${splitType === "custom"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-300 text-gray-700 hover:border-purple-300"
                    }`}
                >
                  Custom Split
                </button>
              </div>

              {splitType === "equal" ? (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Each person pays: <span className="font-semibold">${equalSplitAmount.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Split equally among {members.length} members
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.userId} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span
                        className={`font-semibold ${splitDifference < 0.01 ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        ${customSplitTotal.toFixed(2)} / ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                    {splitDifference >= 0.01 && (
                      <p className="text-xs text-red-600 mt-1">
                        Split amounts must equal the total amount
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <LoadingButton
                type="submit"
                isLoading={loading}
                loadingText={transaction ? "Updating..." : "Adding..."}
                disabled={splitType === "custom" && splitDifference >= 0.01}
                className="flex-1 py-3"
              >
                {transaction ? "Update Expense" : "Add Expense"}
              </LoadingButton>
              <LoadingButton
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 py-3"
              >
                Cancel
              </LoadingButton>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

