import { Hono } from 'hono'
import { findProducts, findProductById } from '@/db/repositories/productRepository'

const productsRouter = new Hono()

// Get all products
productsRouter.get('/', async (c) => {
  try {
    const { category, type, available } = c.req.query()
    
    const products = await findProducts({
      category: category || undefined,
      productType: type === 'single' || type === 'set' ? type : undefined,
      isAvailable: available === undefined ? undefined : available === 'true',
    })
    
    return c.json(products)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

// Get single product
productsRouter.get('/:id', async (c) => {
  try {
    const { id } = c.req.param()
    
    const product = await findProductById(id)
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    return c.json(product)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to fetch product' }, 500)
  }
})

export { productsRouter }
