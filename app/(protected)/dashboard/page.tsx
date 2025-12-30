import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/DashboardContent"

export default async function DashboardPage() {
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
              transactions: {
                select: {
                  amount: true,
                  createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
              _count: {
                select: {
                  transactions: true,
                  members: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const groups = user.groupMemberships.map((gm) => gm.group)

  return (
    <DashboardContent
      userName={user.name}
      groups={groups as any}
    />
  )
}


