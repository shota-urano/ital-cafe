import { prisma } from '../client'

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  })
}

export const updateLastLogin = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      lastLoginAt: new Date(),
    },
  })
}

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })
}
