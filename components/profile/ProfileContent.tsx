"use client"

import { motion } from "framer-motion"
import { User, Mail, Calendar } from "lucide-react"
import { format } from "date-fns"

interface ProfileContentProps {
  user: {
    name: string
    username: string
    createdAt: string | Date
    _count: {
      createdGroups: number
      groupMemberships: number
    }
  }
}

export function ProfileContent({ user }: ProfileContentProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Profile
        </h1>
        <p className="text-gray-600">Your account information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gradient-card rounded-xl p-8 shadow-lg border border-purple-100"
      >
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {user.name}
            </h2>
            <p className="text-gray-600">@{user.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200">
            <User className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-semibold text-gray-900">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200">
            <Mail className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-semibold text-gray-900">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200">
            <Calendar className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(user.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Groups Created
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {user._count.createdGroups}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Groups</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {user._count.groupMemberships}
              </p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <User className="text-pink-600" size={24} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}


