import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import routes
import { healthRouter } from './routes/health'
import { authRouter } from './routes/auth'
import { productsRouter } from './routes/products'
import { ordersRouter } from './routes/orders'
import { tablesRouter } from './routes/tables'

// Create Hono app
const app = new Hono()

// Global middlewares
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:13000',
  credentials: true,
}))

// Routes
app.route('/health', healthRouter)
app.route('/api/auth', authRouter)
app.route('/api/products', productsRouter)
app.route('/api/orders', ordersRouter)
app.route('/api/tables', tablesRouter)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Ital Cafe API Server',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.path} not found`,
  }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  }, 500)
})

// Start server
const port = parseInt(process.env.PORT || '18787')

console.log(`🚀 Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
