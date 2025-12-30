"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, TrendingUp, DollarSign, Clock } from "lucide-react"
import { format } from "date-fns"
import NumberTicker from "@/components/ui/NumberTicker"

type DashboardGroup = {
  id: string
  name: string
  description: string | null
  transactions: {
    amount: number
    createdAt: string | Date
  }[]
  _count: {
    transactions: number
    members: number
  }
}

interface DashboardContentProps {
  userName: string
  groups: DashboardGroup[]
}

export function DashboardContent({ userName, groups }: DashboardContentProps) {
  const totalExpenses = groups.reduce((sum, group) => {
    return (
      sum +
      group.transactions.reduce((txSum, tx) => txSum + tx.amount, 0)
    )
  }, 0)

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600">Manage your expenses and groups</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Groups</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {groups.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                <NumberTicker value={totalExpenses} prefix="$" decimalPlaces={2} />
              </p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <DollarSign className="text-pink-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Groups</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {groups.filter((g) => g._count.transactions > 0).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Groups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
          <Link
            href="/groups/create"
            className="gradient-button text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            Create Group
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">
              You haven&apos;t joined any groups yet
            </p>
            <Link
              href="/groups/create"
              className="gradient-button text-white px-6 py-3 rounded-lg font-semibold inline-block"
            >
              Create Your First Group
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, index) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{group._count.members} members</span>
                    <span>{group._count.transactions} expenses</span>
                  </div>
                  {group.transactions[0] && (
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center text-xs text-gray-500">
                      <Clock size={14} className="mr-1" />
                      <span>
                        Last:{" "}
                        {format(
                          new Date(group.transactions[0].createdAt),
                          "MMM d"
                        )}
                      </span>
                    </div>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}


