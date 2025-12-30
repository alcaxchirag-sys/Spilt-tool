"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSettlement(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const groupId = formData.get("groupId") as string
  const receivedById = formData.get("receivedById") as string
  const amount = parseFloat(formData.get("amount") as string)
  const notes = formData.get("notes") as string

  if (!groupId || !receivedById || !amount || amount <= 0) {
    return { error: "All fields are required" }
  }

  // Verify user is a member
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: session.user.id,
      },
    },
  })

  if (!membership) {
    return { error: "You are not a member of this group" }
  }

  // Check if group is closed
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { status: true },
  })

  if (group?.status === "CLOSED") {
    return { error: "Cannot add settlements to a closed group" }
  }

  // Verify receiver is a member
  const receiverMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: receivedById,
      },
    },
  })

  if (!receiverMembership) {
    return { error: "Receiver is not a member of this group" }
  }

  if (receivedById === session.user.id) {
    return { error: "You cannot settle with yourself" }
  }

  try {
    await prisma.settlement.create({
      data: {
        groupId,
        paidById: session.user.id,
        receivedById,
        amount,
        notes: notes?.trim() || null,
      },
    })

    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Create settlement error:", error)
    return { error: "Failed to create settlement" }
  }
}

export async function deleteSettlement(settlementId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  // Get settlement
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      group: {
        include: {
          members: true,
        },
      },
    },
  })

  if (!settlement) {
    return { error: "Settlement not found" }
  }

  // Check permissions (payer, receiver, or admin)
  const isPayer = settlement.paidById === session.user.id
  const isReceiver = settlement.receivedById === session.user.id
  const isAdmin = settlement.group.members.some(
    (m) => m.userId === session.user.id && m.role === "ADMIN"
  )

  if (!isPayer && !isReceiver && !isAdmin) {
    return { error: "You don't have permission to delete this settlement" }
  }

  // Check if group is closed
  if (settlement.group.status === "CLOSED") {
    return { error: "Cannot delete settlements from a closed group" }
  }

  try {
    await prisma.settlement.delete({
      where: { id: settlementId },
    })

    revalidatePath(`/groups/${settlement.groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete settlement error:", error)
    return { error: "Failed to delete settlement" }
  }
}

