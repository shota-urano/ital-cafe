import { prisma } from '../client'

export type ProductFilters = {
  category?: string
  productType?: 'single' | 'set'
  isAvailable?: boolean
}

export const findProducts = async (filters: ProductFilters = {}) => {
  return prisma.product.findMany({
    where: {
      category: filters.category,
      productType: filters.productType,
      isAvailable: filters.isAvailable,
    },
    include: {
      toppings: {
        include: {
          topping: true,
        },
      },
    },
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  })
}

export const findProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      toppings: {
        include: {
          topping: true,
        },
      },
      setComponents: {
        include: {
          componentProduct: {
            include: {
              toppings: {
                include: {
                  topping: true,
                },
              },
            },
          },
        },
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  })
}
