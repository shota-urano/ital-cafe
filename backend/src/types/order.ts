export type CreateOrderItemInput = {
  productId: string
  quantity: number
  type?: 'single' | 'set'
  toppings?: string[]
  components?: Array<{
    productId: string
    quantity: number
    toppings?: string[]
  }>
}

export type CreateOrderInput = {
  sessionToken: string
  idempotencyKey: string
  items: CreateOrderItemInput[]
}
