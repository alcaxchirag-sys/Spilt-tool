"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, DollarSign, Clock } from "lucide-react"
import { format } from "date-fns"

import { closeGroup } from "@/lib/group-actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Group {
  id: string
  name: string
  description: string | null
  createdById?: string
  status?: string
  _count: {
    transactions: number
    members: number
  }
  transactions: Array<{
    createdAt: string | Date
  }>
}

interface GroupsListProps {
  groups: Group[]
  currentUserId: string
}

export default function GroupsList({ groups, currentUserId }: GroupsListProps) {
  const router = useRouter()

  const handleCloseGroup = async (e: React.MouseEvent, groupId: string) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()

    if (!confirm("Are you sure you want to close this group? This action cannot be undone.")) {
      return
    }

    const result = await closeGroup(groupId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Group closed successfully")
      router.refresh()
    }
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 gradient-card rounded-xl border border-purple-100">
        <Users className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No groups found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group, index) => (
        <Link key={group.id} href={`/groups/${group.id}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full relative group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
              {group.status === "CLOSED" && (
                <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
                  CLOSED
                </span>
              )}
            </div>

            {group.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
            )}

            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Users size={16} className="mr-1" />
                  {group._count.members} members
                </span>
                <span className="text-gray-600 flex items-center">
                  <DollarSign size={16} className="mr-1" />
                  {group._count.transactions} expenses
                </span>
              </div>

              {group.transactions[0] && (
                <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <Clock size={14} className="mr-1" />
                  <span>
                    Last activity: {format(new Date(group.transactions[0].createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {group.createdById === currentUserId && group.status !== "CLOSED" && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleCloseGroup(e, group.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full border border-red-200 transition-colors"
                >
                  Close Group
                </button>
              </div>
            )}
          </motion.div>
        </Link>
      ))}
    </div>
  )
}

