import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile/ProfileContent"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          createdGroups: true,
          groupMemberships: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  return <ProfileContent user={user as any} />
}


