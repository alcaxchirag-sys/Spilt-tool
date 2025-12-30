"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, DollarSign, User, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"

interface Transaction {
  id: string
  title: string
  amount: number
  category: string | null
  notes: string | null
  createdAt: Date
  payer: {
    id: string
    username: string
    name: string
  }
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

interface TransactionDetailModalProps {
  transaction: Transaction
  onClose: () => void
}

export default function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
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
            <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{transaction.title}</h3>
              {transaction.category && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
                  {transaction.category}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <DollarSign className="text-purple-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <User className="text-purple-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Paid by</p>
                  <p className="text-lg font-semibold text-gray-900">{transaction.payer.name}</p>
                  <p className="text-sm text-gray-500">@{transaction.payer.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(transaction.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {transaction.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FileText className="text-purple-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Notes</p>
                      <p className="text-gray-900">{transaction.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Split Details</h4>
              <div className="space-y-2">
                {transaction.splits.map((split) => (
                  <div
                    key={split.userId}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                        {split.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{split.user.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${split.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

