"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { calculateGroupBalance } from "./calculations"

export async function createGroup(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const usernames = formData.get("usernames") as string

  if (!name || name.trim().length === 0) {
    return { error: "Group name is required" }
  }

  try {
    // Create group
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        createdById: session.user.id,
      },
    })

    // Add creator as admin
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: "ADMIN",
      },
    })

    // Add other members by username
    if (usernames && usernames.trim().length > 0) {
      const usernameList = usernames
        .split(",")
        .map((u) => u.trim())
        .filter((u) => u.length > 0 && u !== session.user.username)

      if (usernameList.length > 0) {
        const users = await prisma.user.findMany({
          where: {
            username: {
              in: usernameList,
            },
          },
        })

        await prisma.groupMember.createMany({
          data: users.map((user) => ({
            groupId: group.id,
            userId: user.id,
            role: "MEMBER",
          })),
        })
      }
    }

    revalidatePath("/groups")
    revalidatePath("/dashboard")
    return { success: true, groupId: group.id }
  } catch (error) {
    console.error("Create group error:", error)
    return { error: "Failed to create group" }
  }
}

export async function addMemberToGroup(groupId: string, username: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: "Unauthorized" }
  }

  // Check if user is admin
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: session.user.id,
      },
    },
  })

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only group admins can add members" }
  }

  // Check if group is closed
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { status: true },
  })

  if (group?.status === "CLOSED") {
    return { error: "Cannot add members to a closed group" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id,
        },
      },
    })

    if (existing) {
      return { error: "User is already a member" }
    }

    await prisma.groupMember.create({
      data: {
        groupId,
        userId: user.id,
        role: "MEMBER",
      },
    })

    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Add member error:", error)
    return { error: "Failed to add member" }
  }
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: "Unauthorized" }
  }

  // Check if user is admin
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: session.user.id,
      },
    },
  })

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only group admins can remove members" }
  }

  // Check if group is closed
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { status: true },
  })

  if (group?.status === "CLOSED") {
    return { error: "Cannot remove members from a closed group" }
  }

  // Don't allow removing yourself
  if (userId === session.user.id) {
    return { error: "Cannot remove yourself from group" }
  }

  // Check if user has a non-zero balance
  try {
    const groupData = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        transactions: {
          include: {
            splits: true,
          },
        },
        settlements: true,
      },
    })

    if (groupData) {
      const balance = calculateGroupBalance(
        userId,
        groupData.transactions,
        groupData.settlements
      )

      if (Math.abs(balance) > 0.01) {
        return { error: "Cannot remove member with a non-zero balance. Please settle up first." }
      }
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    })

    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Remove member error:", error)
    return { error: "Failed to remove member" }
  }
}

export async function updateGroup(groupId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: "Unauthorized" }
  }

  // Check if user is admin
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: session.user.id,
      },
    },
  })

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only group admins can edit group details" }
  }

  // Check if group is closed
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { status: true },
  })

  if (group?.status === "CLOSED") {
    return { error: "Cannot edit a closed group" }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name || name.trim().length === 0) {
    return { error: "Group name is required" }
  }

  try {
    await prisma.group.update({
      where: { id: groupId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    })

    revalidatePath(`/groups/${groupId}`)
    revalidatePath("/groups")
    return { success: true }
  } catch (error) {
    console.error("Update group error:", error)
    return { error: "Failed to update group" }
  }
}

export async function closeGroup(groupId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: "Unauthorized" }
  }

  // Check if user is admin
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: session.user.id,
      },
    },
  })

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only group admins can close the group" }
  }

  try {
    // Check if group exists and has status field (this might fail if migration not run)
    // We'll assume migration is run or will be run.
    await prisma.group.update({
      where: { id: groupId },
      data: {
        status: "CLOSED",
      },
    })

    revalidatePath(`/groups/${groupId}`)
    revalidatePath("/groups")
    return { success: true }
  } catch (error) {
    console.error("Close group error:", error)
    return { error: "Failed to close group (Database migration required)" }
  }
}

