import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'
import { rootRouter } from './routes.js'
import { env } from './config/env.js'

const app = express()

const allowedOrigins = [
  env.CLIENT_URL,
  env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
].filter(Boolean)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/v1', rootRouter)
app.use(errorHandler)

export default app