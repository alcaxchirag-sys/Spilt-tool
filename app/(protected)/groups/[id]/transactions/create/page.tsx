import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import AddExpenseForm from "@/components/transactions/AddExpenseForm"

interface CreateTransactionPageProps {
    params: {
        id: string
    }
}

export default async function CreateTransactionPage({ params }: CreateTransactionPageProps) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            redirect("/login")
        }

        const group = await prisma.group.findUnique({
            where: { id: params.id },
            include: {
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
            },
        })

        if (!group) {
            notFound()
        }

        // Check if user is a member
        const isMember = group.members.some((m) => m.userId === session.user.id)
        if (!isMember) {
            redirect("/dashboard")
        }

        // Prepare clean members data (no non-serializable Dates)
        const membersData = group.members.map((m) => ({
            userId: m.userId,
            user: {
                id: m.user.id,
                username: m.user.username,
                name: m.user.name,
            },
        }))

        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <AddExpenseForm
                    groupId={group.id}
                    groupName={group.name}
                    members={membersData}
                />
            </div>
        )
    } catch (error) {
        console.error("Error in CreateTransactionPage:", error)
        throw error // This will be caught by app/error.tsx
    }
}
