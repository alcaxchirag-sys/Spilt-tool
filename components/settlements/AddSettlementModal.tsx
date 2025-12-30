"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { createSettlement } from "@/lib/settlement-actions"
import toast from "react-hot-toast"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
        >
          {/* Header - Sticky */}
          <div className="flex-none px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-2xl z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Record Payment</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
            <form id="settlement-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paid To <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.receivedById}
                  onChange={(e) => setFormData({ ...formData, receivedById: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="0.00"
                />
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
            </form>
          </div>

          {/* Footer - Sticky */}
          <div className="flex-none px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl z-10 pb-safe">
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <LoadingButton
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3"
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                type="submit"
                form="settlement-form"
                isLoading={loading}
                loadingText="Recording..."
                className="w-full sm:flex-1 py-3"
              >
                Record Payment
              </LoadingButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

