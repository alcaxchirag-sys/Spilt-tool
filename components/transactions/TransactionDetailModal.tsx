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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
        >
          {/* Header - Sticky */}
          <div className="flex-none px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-2xl z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{transaction.title}</h3>
              {transaction.category && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                  {transaction.category}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <User className="text-purple-600 dark:text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paid by</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{transaction.payer.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{transaction.payer.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(new Date(transaction.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {transaction.notes && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <FileText className="text-purple-600 dark:text-purple-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-gray-900 dark:text-gray-200">{transaction.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Split Details</h4>
              <div className="space-y-2">
                {transaction.splits.map((split) => (
                  <div
                    key={split.userId}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                        {split.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{split.user.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
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

