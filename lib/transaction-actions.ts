"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createTransaction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const groupId = formData.get("groupId") as string
  const title = formData.get("title") as string
  const amount = parseFloat(formData.get("amount") as string)
  const category = formData.get("category") as string
  const notes = formData.get("notes") as string
  const splitType = formData.get("splitType") as string
  const customSplits = formData.get("customSplits") as string

  if (!groupId || !title || !amount || amount <= 0) {
    return { error: "Title and amount are required" }
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
    return { error: "Cannot add transactions to a closed group" }
  }

  try {
    // Get all group members
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true },
    })

    if (groupMembers.length === 0) {
      return { error: "Group has no members" }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        groupId,
        createdById: session.user.id,
        paidById: session.user.id,
        title: title.trim(),
        amount,
        category: category?.trim() || null,
        notes: notes?.trim() || null,
      },
    })

    // Create splits
    if (splitType === "equal") {
      // Equal split
      const splitAmount = parseFloat((amount / groupMembers.length).toFixed(2))
      const splits = groupMembers.map((member, index) => {
        // For the last member, calculate the remainder to ensure total matches exactly
        if (index === groupMembers.length - 1) {
          const sumOfOthers = splitAmount * (groupMembers.length - 1)
          const remainder = parseFloat((amount - sumOfOthers).toFixed(2))
          return {
            transactionId: transaction.id,
            userId: member.userId,
            amount: remainder,
          }
        }
        return {
          transactionId: transaction.id,
          userId: member.userId,
          amount: splitAmount,
        }
      })

      await prisma.transactionSplit.createMany({
        data: splits,
      })
    } else if (splitType === "custom" && customSplits) {
      // Custom split
      const splits = JSON.parse(customSplits)
      const totalSplit = splits.reduce((sum: number, s: any) => sum + s.amount, 0)

      if (Math.abs(totalSplit - amount) > 0.01) {
        // Delete transaction if splits don't match
        await prisma.transaction.delete({ where: { id: transaction.id } })
        return { error: "Split amounts must equal the total amount" }
      }

      await prisma.transactionSplit.createMany({
        data: splits.map((split: { userId: string; amount: number }) => ({
          transactionId: transaction.id,
          userId: split.userId,
          amount: parseFloat(split.amount.toFixed(2)),
        })),
      })
    }

    revalidatePath(`/groups/${groupId}`)
    return { success: true, transactionId: transaction.id }
  } catch (error) {
    console.error("Create transaction error:", error)
    return { error: "Failed to create transaction" }
  }
}

export async function updateTransaction(transactionId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const title = formData.get("title") as string
  const amount = parseFloat(formData.get("amount") as string)
  const category = formData.get("category") as string
  const notes = formData.get("notes") as string
  const splitType = formData.get("splitType") as string
  const customSplits = formData.get("customSplits") as string

  // Get transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      group: {
        include: {
          members: true,
        },
      },
    },
  })

  if (!transaction) {
    return { error: "Transaction not found" }
  }

  // Check permissions (creator or admin)
  const isCreator = transaction.createdById === session.user.id
  const isAdmin = transaction.group.members.some(
    (m) => m.userId === session.user.id && m.role === "ADMIN"
  )

  if (!isCreator && !isAdmin) {
    return { error: "You don't have permission to edit this transaction" }
  }

  // Check if group is closed
  if (transaction.group.status === "CLOSED") {
    return { error: "Cannot edit transactions in a closed group" }
  }

  try {
    // Update transaction
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        title: title.trim(),
        amount,
        category: category?.trim() || null,
        notes: notes?.trim() || null,
      },
    })

    // Delete old splits
    await prisma.transactionSplit.deleteMany({
      where: { transactionId },
    })

    // Create new splits
    if (splitType === "equal") {
      const groupMembers = transaction.group.members
      const splitAmount = parseFloat((amount / groupMembers.length).toFixed(2))
      const splits = groupMembers.map((member, index) => {
        if (index === groupMembers.length - 1) {
          const sumOfOthers = splitAmount * (groupMembers.length - 1)
          const remainder = parseFloat((amount - sumOfOthers).toFixed(2))
          return {
            transactionId,
            userId: member.userId,
            amount: remainder,
          }
        }
        return {
          transactionId,
          userId: member.userId,
          amount: splitAmount,
        }
      })

      await prisma.transactionSplit.createMany({
        data: splits,
      })
    } else if (splitType === "custom" && customSplits) {
      const splits = JSON.parse(customSplits)
      const totalSplit = splits.reduce((sum: number, s: any) => sum + s.amount, 0)

      if (Math.abs(totalSplit - amount) > 0.01) {
        return { error: "Split amounts must equal the total amount" }
      }

      await prisma.transactionSplit.createMany({
        data: splits.map((split: { userId: string; amount: number }) => ({
          transactionId,
          userId: split.userId,
          amount: parseFloat(split.amount.toFixed(2)),
        })),
      })
    }

    revalidatePath(`/groups/${transaction.groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Update transaction error:", error)
    return { error: "Failed to update transaction" }
  }
}

export async function deleteTransaction(transactionId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  // Get transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      group: {
        include: {
          members: true,
        },
      },
    },
  })

  if (!transaction) {
    return { error: "Transaction not found" }
  }

  // Check permissions (creator or admin)
  const isCreator = transaction.createdById === session.user.id
  const isAdmin = transaction.group.members.some(
    (m) => m.userId === session.user.id && m.role === "ADMIN"
  )

  if (!isCreator && !isAdmin) {
    return { error: "You don't have permission to delete this transaction" }
  }

  // Check if group is closed
  if (transaction.group.status === "CLOSED") {
    return { error: "Cannot delete transactions from a closed group" }
  }

  try {
    await prisma.transaction.delete({
      where: { id: transactionId },
    })

    revalidatePath(`/groups/${transaction.groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete transaction error:", error)
    return { error: "Failed to delete transaction" }
  }
}

