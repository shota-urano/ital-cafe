import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { prisma } from '../client'

export const findActiveSessionByToken = async (token: string) => {
  return prisma.sessionToken.findFirst({
    where: {
      token,
      status: 'active',
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      table: true,
    },
  })
}

export const expireSession = async (id: string) => {
  return prisma.sessionToken.update({
    where: { id },
    data: {
      status: 'expired',
      expiresAt: dayjs().toDate(),
    },
  })
}

export const createSessionForTable = async (tableId: string, metadata: {
  userAgent?: string | null
  ipAddress?: string | null
}) => {
  const expiresAt = dayjs().add(
    parseInt(process.env.SESSION_TTL_MINUTES || '60', 10),
    'minute',
  )

  return prisma.sessionToken.create({
    data: {
      tableId,
      token: nanoid(32),
      expiresAt: expiresAt.toDate(),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      status: 'active',
    },
  })
}
