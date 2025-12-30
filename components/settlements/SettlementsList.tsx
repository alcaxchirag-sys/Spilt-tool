"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import AddSettlementModal from "./AddSettlementModal"
import { deleteSettlement } from "@/lib/settlement-actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Settlement {
  id: string
  amount: number
  notes: string | null
  createdAt: Date
  paidById: string
  payer: {
    id: string
    username: string
    name: string
  }
  receivedById: string
  receiver: {
    id: string
    username: string
    name: string
  }
}

interface SettlementsListProps {
  groupId: string
  settlements: Settlement[]
  members: Array<{
    id: string
    userId: string
    user: {
      id: string
      username: string
      name: string
    }
  }>
  currentUserId: string
  isAdmin: boolean
}

export default function SettlementsList({
  groupId,
  settlements,
  members,
  currentUserId,
  isAdmin,
}: SettlementsListProps) {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)

  const handleDelete = async (settlementId: string) => {
    if (!confirm("Are you sure you want to delete this settlement?")) return

    try {
      const result = await deleteSettlement(settlementId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Settlement deleted successfully!")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const canDelete = (settlement: Settlement) => {
    return (
      settlement.paidById === currentUserId ||
      settlement.receivedById === currentUserId ||
      isAdmin
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Settlements</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="gradient-button text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Record Payment</span>
        </button>
      </div>

      {settlements.length === 0 ? (
        <div className="gradient-card rounded-xl p-12 text-center border border-purple-100">
          <ArrowRight className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No settlements recorded yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="gradient-button text-white px-6 py-3 rounded-lg font-semibold"
          >
            Record Your First Payment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {settlements.map((settlement, index) => (
            <motion.div
              key={settlement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {settlement.payer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{settlement.payer.name}</p>
                        <p className="text-sm text-gray-500">@{settlement.payer.username}</p>
                      </div>
                    </div>

                    <ArrowRight className="text-gray-400" size={20} />

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                        {settlement.receiver.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{settlement.receiver.name}</p>
                        <p className="text-sm text-gray-500">@{settlement.receiver.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900 text-lg">
                      ${settlement.amount.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(settlement.createdAt), "MMM d, yyyy")}</span>
                  </div>

                  {settlement.notes && (
                    <p className="text-sm text-gray-600 mt-2">{settlement.notes}</p>
                  )}
                </div>

                {canDelete(settlement) && (
                  <button
                    onClick={() => handleDelete(settlement.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all ml-4"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddSettlementModal
          groupId={groupId}
          members={members.filter((m) => m.userId !== currentUserId)}
          currentUserId={currentUserId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

