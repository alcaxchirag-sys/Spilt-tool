"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, DollarSign, Clock } from "lucide-react"
import { format } from "date-fns"

interface Group {
  id: string
  name: string
  description: string | null
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
            className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
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
          </motion.div>
        </Link>
      ))}
    </div>
  )
}

