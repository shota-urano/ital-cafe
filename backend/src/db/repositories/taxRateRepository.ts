import { prisma } from '../client'

export const findActiveTaxRateForDate = async (date: Date) => {
  return prisma.taxRateSchedule.findFirst({
    where: {
      effectiveFrom: {
        lte: date,
      },
    },
    orderBy: {
      effectiveFrom: 'desc',
    },
  })
}
