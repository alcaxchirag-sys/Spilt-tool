import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import GroupHeader from "@/components/groups/GroupHeader"
import TransactionsList from "@/components/transactions/TransactionsList"
import BalanceSummary from "@/components/balances/BalanceSummary"
import MembersList from "@/components/groups/MembersList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, Users, DollarSign, CreditCard } from "lucide-react"
import SettlementsList from "@/components/settlements/SettlementsList"
import { motion } from "framer-motion"

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      },
      transactions: {
        include: {
          payer: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      settlements: {
        include: {
          payer: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!group) {
    redirect("/groups")
  }

  // Check if user is a member
  const isMember = group.members.some((m) => m.userId === session.user.id)
  if (!isMember) {
    redirect("/groups")
  }

  const isAdmin = group.members.find(
    (m) => m.userId === session.user.id && m.role === "ADMIN"
  )

  const totalExpenses = group.transactions.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="space-y-6">
      <GroupHeader
        group={group}
        isAdmin={!!isAdmin}
        totalExpenses={totalExpenses}
        memberCount={group.members.length}
      />

      {group.status === "CLOSED" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center space-x-3 text-gray-600 dark:text-gray-400"
        >
          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="font-semibold">This group is closed</p>
            <p className="text-sm">No further expenses or settlements can be added.</p>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <Receipt size={18} />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center space-x-2">
            <DollarSign size={18} />
            <span>Balances</span>
          </TabsTrigger>
          <TabsTrigger value="settlements" className="flex items-center space-x-2">
            <CreditCard size={18} />
            <span>Settlements</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users size={18} />
            <span>Members</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsList
            groupId={group.id}
            transactions={group.transactions}
            members={group.members}
            currentUserId={session.user.id}
            isAdmin={!!isAdmin}
            isGroupClosed={group.status === "CLOSED"}
          />
        </TabsContent>

        <TabsContent value="balances" className="mt-6">
          <BalanceSummary
            groupId={group.id}
            transactions={group.transactions}
            settlements={group.settlements}
            members={group.members.map((m) => m.user)}
            currentUserId={session.user.id}
          />
        </TabsContent>

        <TabsContent value="settlements" className="mt-6">
          <SettlementsList
            groupId={group.id}
            settlements={group.settlements}
            members={group.members}
            currentUserId={session.user.id}
            isAdmin={!!isAdmin}
            isGroupClosed={group.status === "CLOSED"}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <MembersList
            groupId={group.id}
            members={group.members}
            currentUserId={session.user.id}
            isAdmin={!!isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

