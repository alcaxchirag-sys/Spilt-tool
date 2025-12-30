"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { createSettlement } from "@/lib/settlement-actions"
import toast from "react-hot-toast"

interface Member {
  id: string
  userId: string
  user: {
    id: string
    username: string
    name: string
  }
}

interface AddSettlementModalProps {
  groupId: string
  members: Member[]
  currentUserId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddSettlementModal({
  groupId,
  members,
  currentUserId,
  onClose,
  onSuccess,
}: AddSettlementModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    receivedById: "",
    amount: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("groupId", groupId)
      formDataObj.append("receivedById", formData.receivedById)
      formDataObj.append("amount", formData.amount)
      formDataObj.append("notes", formData.notes)

      const result = await createSettlement(formDataObj)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Payment recorded successfully!")
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full"
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
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
                Paid To <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.receivedById}
                onChange={(e) => setFormData({ ...formData, receivedById: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">Select a member</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name} (@{member.user.username})
                  </option>
                ))}
              </select>
            </div>

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

            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 gradient-button text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Recording..." : "Record Payment"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

