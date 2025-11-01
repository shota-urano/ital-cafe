import { Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import { prisma } from '@/db/client'
import { findProductById } from '@/db/repositories/productRepository'
import { findActiveSessionByToken, expireSession } from '@/db/repositories/sessionRepository'
import { findActiveTaxRateForDate } from '@/db/repositories/taxRateRepository'
import { findToppingsByIds } from '@/db/repositories/toppingRepository'
import { CreateOrderInput } from '@/types/order'

export class OrderServiceError extends Error {
  constructor(public readonly code: 'INVALID_SESSION' | 'SESSION_EXPIRED' | 'INVALID_PRODUCT' | 'INVALID_TOPPING' | 'INVALID_COMPONENT' | 'IDEMPOTENT_ORDER', message: string) {
    super(message)
  }
}

const decimal = (value: Prisma.Decimal.Value) => new Prisma.Decimal(value)

const toCurrency = (value: Prisma.Decimal) => value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)

const buildToppingMap = (toppingIds: string[], allowedIds: Set<string>) => {
  if (!toppingIds?.length) {
    return [] as string[]
  }
  const unique = Array.from(new Set(toppingIds))
  if (unique.some((id) => !allowedIds.has(id))) {
    throw new OrderServiceError('INVALID_TOPPING', '選択できないトッピングが含まれています')
  }
  return unique
}

export const createOrder = async (input: CreateOrderInput) => {
  const session = await findActiveSessionByToken(input.sessionToken)
  if (!session) {
    await expireSessionIfNeeded(input.sessionToken)
    throw new OrderServiceError('INVALID_SESSION', 'セッションが無効です')
  }

  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
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

  if (existing) {
    throw new OrderServiceError('IDEMPOTENT_ORDER', existing.id)
  }

  const orderDate = dayjs().toDate()
  const taxRateRecord = await findActiveTaxRateForDate(orderDate)
  const taxRate = taxRateRecord ? decimal(taxRateRecord.rate).div(100) : decimal('0.10')

  const preparedItems = await Promise.all(input.items.map(async (item) => prepareOrderItem(item)))

  let subtotal = decimal(0)
  preparedItems.forEach((item) => {
    subtotal = subtotal.add(item.parent.totalPrice)
    item.components.forEach((component) => {
      subtotal = subtotal.add(component.totalPrice)
    })
  })

  const tax = toCurrency(subtotal.mul(taxRate))
  const total = toCurrency(subtotal.add(tax))

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        orderNumber: nanoid(10),
        tableNo: session.table.number,
        subtotal: toCurrency(subtotal),
        tax,
        total,
        status: 'unpaid',
        sessionTokenId: session.id,
        idempotencyKey: input.idempotencyKey,
      },
    })

    for (const prepared of preparedItems) {
      const parentItem = await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: prepared.parent.productId,
          quantity: prepared.parent.quantity,
          unitPrice: prepared.parent.unitPrice,
          totalPrice: prepared.parent.totalPrice,
        },
      })

      if (prepared.parent.toppings.length) {
        await tx.orderItemTopping.createMany({
          data: prepared.parent.toppings.map((topping) => ({
            orderItemId: parentItem.id,
            toppingId: topping.toppingId,
            quantity: topping.quantity,
            unitPrice: topping.unitPrice,
          })),
        })
      }

      for (const component of prepared.components) {
        const componentItem = await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: component.productId,
            quantity: component.quantity,
            unitPrice: component.unitPrice,
            totalPrice: component.totalPrice,
            parentItemId: parentItem.id,
          },
        })

        if (component.toppings.length) {
          await tx.orderItemTopping.createMany({
            data: component.toppings.map((topping) => ({
              orderItemId: componentItem.id,
              toppingId: topping.toppingId,
              quantity: topping.quantity,
              unitPrice: topping.unitPrice,
            })),
          })
        }
      }
    }

    return tx.order.findUnique({
      where: { id: createdOrder.id },
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
  })

  if (!order) {
    throw new Error('Failed to retrieve created order')
  }

  return order
}

const expireSessionIfNeeded = async (token: string) => {
  const session = await prisma.sessionToken.findUnique({ where: { token } })
  if (session && session.status === 'active') {
    await expireSession(session.id)
  }
}

type PreparedTopping = {
  toppingId: string
  quantity: number
  unitPrice: Prisma.Decimal
  totalPrice: Prisma.Decimal
}

type PreparedOrderItem = {
  parent: {
    productId: string
    quantity: number
    unitPrice: Prisma.Decimal
    totalPrice: Prisma.Decimal
    toppings: PreparedTopping[]
  }
  components: Array<{
    productId: string
    quantity: number
    unitPrice: Prisma.Decimal
    totalPrice: Prisma.Decimal
    toppings: PreparedTopping[]
  }>
}

const prepareOrderItem = async (item: CreateOrderInput['items'][number]): Promise<PreparedOrderItem> => {
  const product = await findProductById(item.productId)
  if (!product || !product.isAvailable) {
    throw new OrderServiceError('INVALID_PRODUCT', '指定された商品が利用できません')
  }

  const quantity = item.quantity
  const allowedToppingIds = new Set(product.toppings.map((relation) => relation.toppingId))
  const productToppings = await findToppingsByIds(buildToppingMap(item.toppings ?? [], allowedToppingIds))
  const parentToppingEntries = productToppings.map<PreparedTopping>((topping) => {
    const unitPrice = decimal(topping.priceTaxIncl)
    const totalPrice = unitPrice.mul(quantity)
    return {
      toppingId: topping.id,
      quantity,
      unitPrice,
      totalPrice,
    }
  })

  const parentUnitPrice = decimal(product.priceTaxIncl).add(
    parentToppingEntries.reduce((acc, topping) => acc.add(topping.unitPrice), decimal(0)),
  )
  const parentTotalPrice = parentUnitPrice.mul(quantity)

  if (product.productType === 'set') {
    return prepareSetOrderItem(product, { ...item, quantity }, parentToppingEntries, parentUnitPrice, parentTotalPrice)
  }

  return {
    parent: {
      productId: product.id,
      quantity,
      unitPrice: toCurrency(parentUnitPrice),
      totalPrice: toCurrency(parentTotalPrice),
      toppings: parentToppingEntries,
    },
    components: [],
  }
}

const prepareSetOrderItem = async (
  product: NonNullable<Awaited<ReturnType<typeof findProductById>>>,
  item: CreateOrderInput['items'][number],
  parentToppings: PreparedTopping[],
  parentUnitPrice: Prisma.Decimal,
  parentTotalPrice: Prisma.Decimal,
) => {
  const allowedComponents = product.setComponents
  if (!allowedComponents.length) {
    throw new OrderServiceError('INVALID_COMPONENT', 'セット商品の構成が未設定です')
  }

  const requestedComponents = item.components ?? []
  const parentQuantity = item.quantity

  const componentByProductId = new Map(allowedComponents.map((component) => [component.componentProductId, component]))

  requestedComponents.forEach((component) => {
    if (!componentByProductId.has(component.productId)) {
      throw new OrderServiceError('INVALID_COMPONENT', '選択された構成品はセットに含まれません')
    }
  })

  const effectiveSelections = allowedComponents.reduce<Array<{ def: typeof allowedComponents[number]; quantity: number; toppings?: string[] }>>((acc, def) => {
    const requested = requestedComponents.find((component) => component.productId === def.componentProductId)

    if (requested) {
      acc.push({ def, quantity: requested.quantity, toppings: requested.toppings })
      return acc
    }

    if (def.required && def.minQty > 0) {
      const defaultQty = def.defaultQty > 0 ? def.defaultQty : def.minQty
      acc.push({ def, quantity: defaultQty })
    }

    return acc
  }, [])

  const preparedComponents: PreparedOrderItem['components'] = []

  await Promise.all(effectiveSelections.map(async ({ def, quantity, toppings: toppingIds }) => {
    if (quantity < def.minQty || quantity > def.maxQty) {
      throw new OrderServiceError('INVALID_COMPONENT', '構成品の数量が範囲外です')
    }

    const componentProduct = def.componentProduct
    const allowedToppingIds = new Set(componentProduct.toppings.map((relation) => relation.toppingId))
    const normalizedToppings = buildToppingMap(toppingIds ?? [], allowedToppingIds)
    const toppings = await findToppingsByIds(normalizedToppings)

    const componentBasePrice = decimal(def.extraPrice ?? 0)
    const componentTotalQuantity = quantity * parentQuantity
    const toppingEntries = toppings.map<PreparedTopping>((topping) => {
      const unitPrice = decimal(topping.priceTaxIncl)
      const totalPrice = unitPrice.mul(componentTotalQuantity)
      return {
        toppingId: topping.id,
        quantity: componentTotalQuantity,
        unitPrice,
        totalPrice,
      }
    })

    const toppingUnitSum = toppingEntries.reduce((acc, topping) => acc.add(topping.unitPrice), decimal(0))
    const componentUnitPrice = componentBasePrice.add(toppingUnitSum)
    const componentTotalPrice = componentUnitPrice.mul(componentTotalQuantity)

    preparedComponents.push({
      productId: componentProduct.id,
      quantity: componentTotalQuantity,
      unitPrice: toCurrency(componentUnitPrice),
      totalPrice: toCurrency(componentTotalPrice),
      toppings: toppingEntries,
    })
  }))

  const parent = {
    productId: product.id,
    quantity: parentQuantity,
    unitPrice: toCurrency(parentUnitPrice),
    totalPrice: toCurrency(parentTotalPrice),
    toppings: parentToppings,
  }

  return {
    parent,
    components: preparedComponents,
  }
}
