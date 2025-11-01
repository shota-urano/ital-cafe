import { OrderStatus } from '@prisma/client'
import { prisma } from '../client'

export type OrderFilters = {
  status?: OrderStatus
  tableNo?: string
}

export const findOrders = async (filters: OrderFilters = {}) => {
  return prisma.order.findMany({
    where: {
      status: filters.status,
      tableNo: filters.tableNo,
    },
    include: {
      items: {
        include: {
          product: true,
          toppings: {
            include: {
              topping: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const now = new Date()
  return prisma.order.update({
    where: { id },
    data: {
      status,
      paidAt: status === 'paid' ? now : undefined,
      servedAt: status === 'served' ? now : undefined,
    },
  })
}

export const findOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
          toppings: {
            include: {
              topping: true,
            },
          },
        },
      },
    },
  })
}
