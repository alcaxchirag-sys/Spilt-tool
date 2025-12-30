"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import GroupsList from "@/components/groups/GroupsList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SimpleGroup = {
  id: string
  name: string
  description: string | null
  createdById?: string
  _count: {
    transactions: number
    members: number
  }
  transactions: {
    createdAt: string | Date
  }[]
}

interface GroupsPageContentProps {
  createdGroups: SimpleGroup[]
  joinedGroups: SimpleGroup[]
  currentUserId: string
}

export function GroupsPageContent({
  createdGroups,
  joinedGroups,
  currentUserId,
}: GroupsPageContentProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            My Groups
          </h1>
          <p className="text-gray-600">Manage your expense groups</p>
        </div>
        <Link
          href="/groups/create"
          className="gradient-button text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <PlusCircle size={20} />
          <span>Create Group</span>
        </Link>
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="created">Created By Me</TabsTrigger>
          <TabsTrigger value="joined">I Joined</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <GroupsList
            groups={[...createdGroups, ...joinedGroups]}
            currentUserId={currentUserId}
          />
        </TabsContent>

        <TabsContent value="created" className="mt-6">
          <GroupsList groups={createdGroups} currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="joined" className="mt-6">
          <GroupsList groups={joinedGroups} currentUserId={currentUserId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}


