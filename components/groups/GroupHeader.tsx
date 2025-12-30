"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit2, Save, X, Users, DollarSign } from "lucide-react"
import { updateGroup } from "@/lib/group-actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import NumberTicker from "@/components/ui/NumberTicker"

interface GroupHeaderProps {
  group: {
    id: string
    name: string
    description: string | null
    status?: string
  }
  isAdmin: boolean
  totalExpenses: number
  memberCount: number
}

export default function GroupHeader({
  group,
  isAdmin,
  totalExpenses,
  memberCount,
}: GroupHeaderProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("description", formData.description)

      const result = await updateGroup(group.id, formDataObj)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Group updated successfully!")
        setIsEditing(false)
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
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 text-2xl font-bold rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            placeholder="Add a description..."
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="gradient-button text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
            >
              <Save size={16} className="inline mr-1" />
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setFormData({ name: group.name, description: group.description || "" })
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                {group.status === "CLOSED" && (
                  <span className="px-3 py-1 text-sm font-bold bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                    CLOSED
                  </span>
                )}
              </div>
              {group.description && (
                <p className="text-gray-600">{group.description}</p>
              )}
            </div>
            {isAdmin && group.status !== "CLOSED" && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all"
              >
                <Edit2 size={20} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center text-gray-600">
              <Users size={18} className="mr-2" />
              <span className="font-medium">{memberCount} members</span>
            </div>
            <div className="flex items-center text-gray-600">
              <DollarSign size={18} className="mr-2" />
              <span className="font-medium">
                <NumberTicker value={totalExpenses} prefix="$" decimalPlaces={2} /> total expenses
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

