"use server"

import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!name || !username || !password) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return { error: "Username already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "Failed to create account" }
  }
}

