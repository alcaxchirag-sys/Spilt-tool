"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { createGroup } from "@/lib/group-actions"
import LoadingButton from "@/components/ui/LoadingButton"

export default function CreateGroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    usernames: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("description", formData.description)
      formDataObj.append("usernames", formData.usernames)

      const result = await createGroup(formDataObj)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Group created successfully!")
        router.push(`/groups/${result.groupId}`)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-card rounded-xl p-8 shadow-lg border border-purple-100"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Create New Group
        </h1>
        <p className="text-gray-600 mb-6">Start splitting expenses with your friends</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g., Goa Trip, Office Lunch, Roommates"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Add a description for this group..."
            />
          </div>

          <div>
            <label htmlFor="usernames" className="block text-sm font-medium text-gray-700 mb-2">
              Add Members (Optional)
            </label>
            <input
              id="usernames"
              type="text"
              value={formData.usernames}
              onChange={(e) => setFormData({ ...formData, usernames: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter usernames separated by commas (e.g., john, jane, bob)"
            />
            <p className="text-xs text-gray-500 mt-2">
              You can add members later from the group page
            </p>
          </div>

          <div className="flex space-x-4">
            <LoadingButton
              type="submit"
              isLoading={loading}
              loadingText="Creating..."
              className="flex-1 py-3"
            >
              Create Group
            </LoadingButton>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

