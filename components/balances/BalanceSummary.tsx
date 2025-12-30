"use client"

import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react"
import { calculateNetBalances, simplifyDebts, UserBalance } from "@/lib/calculations"

interface BalanceSummaryProps {
  groupId: string
  transactions: Array<{
    paidById: string
    amount: number
    splits: Array<{
      userId: string
      amount: number
    }>
  }>
  settlements: Array<{
    paidById: string
    receivedById: string
    amount: number
  }>
  members: Array<{
    id: string
    username: string
    name: string
  }>
  currentUserId: string
}

export default function BalanceSummary({
  transactions,
  settlements,
  members,
  currentUserId,
}: BalanceSummaryProps) {
  const balances = calculateNetBalances(transactions, settlements, members)
  const simplifiedDebts = simplifyDebts(balances)

  const currentUserBalance = balances.find((b) => b.userId === currentUserId)

  return (
    <div className="space-y-6">
      {/* Current User Balance Card */}
      {currentUserBalance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`gradient-card rounded-xl p-6 shadow-lg border ${
            currentUserBalance.balance > 0
              ? "border-green-200 bg-gradient-to-br from-green-50 to-white"
              : currentUserBalance.balance < 0
              ? "border-red-200 bg-gradient-to-br from-red-50 to-white"
              : "border-purple-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Your Balance</p>
              <p
                className={`text-3xl font-bold ${
                  currentUserBalance.balance > 0
                    ? "text-green-600"
                    : currentUserBalance.balance < 0
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {currentUserBalance.balance > 0
                  ? `You are owed $${Math.abs(currentUserBalance.balance).toFixed(2)}`
                  : currentUserBalance.balance < 0
                  ? `You owe $${Math.abs(currentUserBalance.balance).toFixed(2)}`
                  : "Settled up"}
              </p>
            </div>
            {currentUserBalance.balance !== 0 && (
              <div
                className={`p-4 rounded-lg ${
                  currentUserBalance.balance > 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {currentUserBalance.balance > 0 ? (
                  <TrendingUp className="text-green-600" size={32} />
                ) : (
                  <TrendingDown className="text-red-600" size={32} />
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Simplified Debts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Who owes whom</h3>

        {simplifiedDebts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Everyone is settled up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {simplifiedDebts.map((debt, index) => (
              <motion.div
                key={`${debt.fromUserId}-${debt.toUserId}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {debt.fromName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{debt.fromName}</p>
                    <p className="text-sm text-gray-500">@{debt.fromUsername}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mx-4">
                  <span className="text-lg font-bold text-gray-900">
                    ${debt.amount.toFixed(2)}
                  </span>
                  <ArrowRight className="text-gray-400" size={20} />
                </div>

                <div className="flex items-center space-x-3 flex-1 justify-end">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                    {debt.toName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{debt.toName}</p>
                    <p className="text-sm text-gray-500">@{debt.toUsername}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* All Balances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">All Balances</h3>
        <div className="space-y-2">
          {balances.map((balance, index) => (
            <motion.div
              key={balance.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                  {balance.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{balance.name}</span>
              </div>
              <span
                className={`font-semibold ${
                  balance.balance > 0
                    ? "text-green-600"
                    : balance.balance < 0
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {balance.balance > 0
                  ? `+$${balance.balance.toFixed(2)}`
                  : balance.balance < 0
                  ? `-$${Math.abs(balance.balance).toFixed(2)}`
                  : "$0.00"}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

