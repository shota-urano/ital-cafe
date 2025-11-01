import { prisma } from '../client'

export const findAllTables = async () => {
  return prisma.table.findMany({
    orderBy: {
      number: 'asc',
    },
  })
}

export const findActiveTableByToken = async (token: string) => {
  return prisma.table.findFirst({
    where: {
      tableToken: token,
      isActive: true,
    },
  })
}

export const createTable = async (input: {
  number: string
  name?: string | null
  tableToken: string
  qrUrl: string
}) => {
  return prisma.table.create({
    data: {
      number: input.number,
      name: input.name,
      tableToken: input.tableToken,
      qrUrl: input.qrUrl,
      isActive: true,
    },
  })
}
