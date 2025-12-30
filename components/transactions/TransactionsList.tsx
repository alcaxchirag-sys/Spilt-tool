"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react"
import { format } from "date-fns"
import AddTransactionModal from "./AddTransactionModal"
import TransactionDetailModal from "./TransactionDetailModal"
import { deleteTransaction } from "@/lib/transaction-actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  title: string
  amount: number
  category: string | null
  notes: string | null
  createdAt: Date
  paidById: string
  payer: {
    id: string
    username: string
    name: string
  }
  createdById: string
  creator: {
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

interface Member {
  id: string
  userId: string
  user: {
    id: string
    username: string
    name: string
  }
}

interface TransactionsListProps {
  groupId: string
  transactions: Transaction[]
  members: Member[]
  currentUserId: string
  isAdmin: boolean
  isGroupClosed: boolean
}

export default function TransactionsList({
  groupId,
  transactions,
  members,
  currentUserId,
  isAdmin,
  isGroupClosed,
}: TransactionsListProps) {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [optimisticTransactions, setOptimisticTransactions] = useState(transactions)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    setOptimisticTransactions(transactions)
  }, [transactions])

  const handleDelete = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    // Optimistic update
    const previousTransactions = [...optimisticTransactions]
    setOptimisticTransactions((prev) => prev.filter((t) => t.id !== transactionId))

    try {
      const result = await deleteTransaction(transactionId)

      if (result.error) {
        toast.error(result.error)
        setOptimisticTransactions(previousTransactions) // Revert
      } else {
        toast.success("Transaction deleted successfully!")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
      setOptimisticTransactions(previousTransactions) // Revert
    }
  }

  const canEdit = (transaction: Transaction) => {
    if (isGroupClosed) return false
    return transaction.createdById === currentUserId || isAdmin
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        {!isGroupClosed && (
          <Link
            href={`/groups/${groupId}/transactions/create`}
            className="gradient-button text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Expense</span>
          </Link>
        )}
      </div>

      {optimisticTransactions.length === 0 ? (
        <div className="gradient-card rounded-xl p-12 text-center border border-purple-100">
          <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No transactions yet</p>
          {!isGroupClosed && (
            <Link
              href={`/groups/${groupId}/transactions/create`}
              className="gradient-button text-white px-6 py-3 rounded-lg font-semibold inline-block"
            >
              Add Your First Expense
            </Link>
          )}
        </div>
      ) : (
        <motion.div layout className="space-y-4">
          <AnimatePresence mode="popLayout">
            {optimisticTransactions.map((transaction) => (
              <motion.div
                layout
                key={transaction.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.2 }}
                className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{transaction.title}</h3>
                      {transaction.category && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          {transaction.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="font-semibold text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </span>
                      <span>Paid by {transaction.payer.name}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    {transaction.notes && (
                      <p className="text-sm text-gray-600 line-clamp-2">{transaction.notes}</p>
                    )}
                  </div>
                  {canEdit(transaction) && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTransaction(transaction)
                        }}
                        className="p-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(transaction.id)
                        }}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {showAddModal && (
        <AddTransactionModal
          groupId={groupId}
          members={members}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            router.refresh()
          }}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {editingTransaction && (
        <AddTransactionModal
          groupId={groupId}
          members={members}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={() => {
            setEditingTransaction(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

