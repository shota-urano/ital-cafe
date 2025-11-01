import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { findAllTables, findActiveTableByToken, createTable } from '@/db/repositories/tableRepository'
import { createSessionForTable } from '@/db/repositories/sessionRepository'

const tablesRouter = new Hono()

const createTableSchema = z.object({
  number: z.string().min(1),
  name: z.string().optional().nullable(),
})

// Get all tables
tablesRouter.get('/', async (c) => {
  try {
    const tables = await findAllTables()
    
    return c.json(tables)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to fetch tables' }, 500)
  }
})

// Get table by token (for QR code scan)
tablesRouter.get('/t/:token', async (c) => {
  try {
    const { token } = c.req.param()
    
    const table = await findActiveTableByToken(token)
    
    if (!table) {
      return c.json({ error: 'Invalid table' }, 404)
    }
    
    const sessionToken = await createSessionForTable(table.id, {
      userAgent: c.req.header('User-Agent'),
      ipAddress: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
    })
    
    return c.json({
      table: {
        id: table.id,
        number: table.number,
        name: table.name,
      },
      sessionToken: sessionToken.token,
      expiresAt: sessionToken.expiresAt,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to process table token' }, 500)
  }
})

// Create table (admin only)
tablesRouter.post('/', async (c) => {
  try {
    const payload = createTableSchema.parse(await c.req.json<unknown>())
    const { number, name } = payload
    
    const tableToken = nanoid(16)
    
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:13000'}/t/${tableToken}`
    
    const table = await createTable({
      number,
      name,
      tableToken,
      qrUrl,
    })
    
    return c.json(table, 201)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to create table' }, 500)
  }
})

export { tablesRouter }
