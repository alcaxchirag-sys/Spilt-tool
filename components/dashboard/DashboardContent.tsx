"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, TrendingUp, DollarSign, Clock } from "lucide-react"
import { format } from "date-fns"
import NumberTicker from "@/components/ui/NumberTicker"
import EmptyState from "@/components/ui/EmptyState"

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

import Logo from "@/components/ui/Logo"

export function DashboardContent({ userName, groups }: DashboardContentProps) {
  const totalExpenses = groups.reduce((sum, group) => {
    return (
      sum +
      group.transactions.reduce((txSum, tx) => txSum + tx.amount, 0)
    )
  }, 0)

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <Logo size="lg" className="mb-2" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {userName}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Here&apos;s what&apos;s happening with your groups.</p>
        </div>
        <Link
          href="/groups/create"
          className="gradient-button text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
        >
          Create New Group
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="gradient-card rounded-[2rem] p-8 shadow-xl border border-white/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Groups</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">
                {groups.length}
              </p>
            </div>
            <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="text-violet-600 dark:text-violet-400" size={28} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="gradient-card rounded-[2rem] p-8 shadow-xl border border-white/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Expenses</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">
                <NumberTicker value={totalExpenses} prefix="$" decimalPlaces={2} />
              </p>
            </div>
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
              <DollarSign className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="gradient-card rounded-[2rem] p-8 shadow-xl border border-white/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Groups</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">
                {groups.filter((g) => g._count.transactions > 0).length}
              </p>
            </div>
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={28} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Groups Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Groups</h2>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No groups yet"
            description="Create your first group to start splitting expenses with friends and family."
            actionLabel="Create Your First Group"
            actionHref="/groups/create"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {group.name}
                    </h3>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <Clock size={18} className="text-slate-400" />
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {group._count.members} members
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {group._count.transactions} expenses
                    </span>
                  </div>

                  {group.transactions[0] && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs text-slate-400">
                      <span>
                        Last activity:{" "}
                        {format(
                          new Date(group.transactions[0].createdAt),
                          "MMM d, yyyy"
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


