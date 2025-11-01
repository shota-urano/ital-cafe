import { Hono } from 'hono'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { findUserByEmail, updateLastLogin, findUserById } from '@/db/repositories/userRepository'

const authRouter = new Hono()

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Login endpoint
authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json<unknown>()
    const { email, password } = loginSchema.parse(body)
    
    // Find user
    const user = await findUserByEmail(email)
    
    if (!user || !user.isActive) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )
    
    // Update last login
    await updateLastLogin(user.id)
    
    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error(error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Logout endpoint (client-side token removal)
authRouter.post('/logout', (c) => {
  return c.json({ message: 'Logged out successfully' })
})

// Verify token endpoint
authRouter.get('/verify', async (c) => {
  const authorization = c.req.header('Authorization')
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  const token = authorization.split(' ')[1]
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')

    if (!isDecodedWithId(decoded)) {
      return c.json({ error: 'Invalid token' }, 401)
    }
    
    const user = await findUserById(decoded.id)
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user })
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

export { authRouter }

const isDecodedWithId = (decoded: string | JwtPayload): decoded is JwtPayload & { id: string } => {
  if (typeof decoded !== 'object' || decoded === null) {
    return false
  }
  const candidate = decoded as { id?: unknown }
  return typeof candidate.id === 'string'
}
