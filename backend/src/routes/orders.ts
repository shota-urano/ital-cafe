import { Hono } from 'hono'
import { OrderStatus } from '@prisma/client'
import { z } from 'zod'
import { findOrders, updateOrderStatus, findOrderById } from '@/db/repositories/orderRepository'
import { createOrder, OrderServiceError } from '@/services/orderService'

const ordersRouter = new Hono()

// Validation schemas
const createOrderSchema = z.object({
  sessionToken: z.string(),
  idempotencyKey: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    type: z.enum(['single', 'set']).optional(),
    toppings: z.array(z.string()).optional(),
    components: z.array(z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      toppings: z.array(z.string()).optional(),
    })).optional(),
  })),
})

// Get orders
ordersRouter.get('/', async (c) => {
  try {
    const { status, tableNo } = c.req.query()
    
    const orders = await findOrders({
      status: status && Object.values(OrderStatus).includes(status as OrderStatus)
        ? (status as OrderStatus)
        : undefined,
      tableNo: tableNo || undefined,
    })
    
    return c.json(orders)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

// Create order
ordersRouter.post('/', async (c) => {
  try {
    const body = await c.req.json<unknown>()
    const data = createOrderSchema.parse(body)
    
    // Verify session token
    try {
      const order = await createOrder(data)
      return c.json(order, 201)
    } catch (error) {
      if (error instanceof OrderServiceError) {
        switch (error.code) {
          case 'INVALID_SESSION':
          case 'SESSION_EXPIRED':
            return c.json({ error: 'Invalid session' }, 401)
          case 'INVALID_PRODUCT':
          case 'INVALID_TOPPING':
          case 'INVALID_COMPONENT':
            return c.json({ error: error.message }, 400)
          case 'IDEMPOTENT_ORDER': {
            const order = await findOrderById(error.message)
            if (order) {
              return c.json(order)
            }
            return c.json({ error: 'Order already exists' }, 409)
          }
          default:
            break
        }
      }
      throw error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error(error)
    return c.json({ error: 'Failed to create order' }, 500)
  }
})

// Update order status
ordersRouter.patch('/:id/status', async (c) => {
  try {
    const { id } = c.req.param()
    const body = await c.req.json<unknown>()
    const statusPayload = z.object({ status: z.nativeEnum(OrderStatus) }).safeParse(body)
    if (!statusPayload.success) {
      return c.json({ error: 'Invalid status' }, 400)
    }
    const { status } = statusPayload.data

    const order = await updateOrderStatus(id, status)
    
    return c.json(order)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to update order status' }, 500)
  }
})

export { ordersRouter }
