import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const healthRouter = new Hono()
const prisma = new PrismaClient()

healthRouter.get('/', async (c) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: 'operational',
      },
    })
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: 'error',
      },
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    }, 503)
  }
})

export { healthRouter }
