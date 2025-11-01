import { prisma } from '../client'

export const findToppingsByIds = async (ids: string[]) => {
  if (!ids.length) {
    return []
  }
  return prisma.topping.findMany({
    where: {
      id: {
        in: ids,
      },
      isAvailable: true,
    },
  })
}
