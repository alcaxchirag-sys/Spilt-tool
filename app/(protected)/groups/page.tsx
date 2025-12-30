import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { GroupsPageContent } from "@/components/groups/GroupsPageContent"

export default async function GroupsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      groupMemberships: {
        include: {
          group: {
            include: {
              _count: {
                select: {
                  transactions: true,
                  members: true,
                },
              },
              transactions: {
                select: {
                  createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
      createdGroups: {
        include: {
          _count: {
            select: {
              transactions: true,
              members: true,
            },
          },
          transactions: {
            select: {
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const createdGroups = user.createdGroups
  const joinedGroups = user.groupMemberships
    .filter((gm) => gm.group.createdById !== user.id)
    .map((gm) => gm.group)

  return (
    <GroupsPageContent
      createdGroups={createdGroups as any}
      joinedGroups={joinedGroups as any}
      currentUserId={user.id}
    />
  )
}


