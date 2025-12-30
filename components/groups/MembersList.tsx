"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { UserMinus, UserPlus, Crown } from "lucide-react"
import { addMemberToGroup, removeMemberFromGroup } from "@/lib/group-actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Member {
  id: string
  userId: string
  role: "ADMIN" | "MEMBER"
  user: {
    id: string
    username: string
    name: string
  }
}

interface MembersListProps {
  groupId: string
  members: Member[]
  currentUserId: string
  isAdmin: boolean
}

export default function MembersList({
  groupId,
  members,
  currentUserId,
  isAdmin,
}: MembersListProps) {
  const router = useRouter()
  const [addingMember, setAddingMember] = useState(false)
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    try {
      const result = await addMemberToGroup(groupId, username.trim())

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Member added successfully!")
        toast("Expenses rebalanced due to new member joining", {
          icon: "🔄",
          duration: 4000,
        })
        setUsername("")
        setAddingMember(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    setLoading(true)
    try {
      const result = await removeMemberFromGroup(groupId, userId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Member removed successfully!")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-card rounded-xl p-6 shadow-lg border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Members</h2>
        {isAdmin && (
          <button
            onClick={() => setAddingMember(!addingMember)}
            className="gradient-button text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {addingMember && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleAddMember}
          className="mb-6 p-4 bg-purple-50 rounded-lg"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="gradient-button text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingMember(false)
                setUsername("")
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div className="space-y-3">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{member.user.name}</span>
                  {member.role === "ADMIN" && (
                    <Crown size={16} className="text-yellow-500" />
                  )}
                </div>
                <span className="text-sm text-gray-500">@{member.user.username}</span>
              </div>
            </div>
            {isAdmin && member.userId !== currentUserId && (
              <button
                onClick={() => handleRemoveMember(member.userId)}
                disabled={loading}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <UserMinus size={20} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

