import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// ============ CLIENTES ============

app.get('/api/clientes', async (req, res) => {
  try {
    const filtro = req.query.q as string || ''
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { rsocial: { contains: filtro, mode: 'insensitive' } },
          { cuit: { contains: filtro, mode: 'insensitive' } },
          { codigo: { equals: filtro ? parseInt(filtro) : undefined } }
        ]
      },
      orderBy: { codigo: 'asc' }
    })
    res.json({ success: true, data: clientes })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    res.json({ success: true, data: cliente })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({
      data: req.body
    })
    res.json({ success: true, data: cliente })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    })
    res.json({ success: true, data: cliente })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============ ARTICULOS ============

app.get('/api/articulos', async (req, res) => {
  try {
    const filtro = req.query.q as string || ''
    const articulos = await prisma.articulo.findMany({
      where: {
        OR: [
          { descripcion: { contains: filtro, mode: 'insensitive' } },
          { codigo: { equals: filtro ? parseInt(filtro) : undefined } }
        ]
      },
      include: { rubro: true },
      orderBy: { codigo: 'asc' }
    })
    res.json({ success: true, data: articulos })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/articulos/:id', async (req, res) => {
  try {
    const articulo = await prisma.articulo.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { rubro: true }
    })
    res.json({ success: true, data: articulo })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/articulos', async (req, res) => {
  try {
    const articulo = await prisma.articulo.create({
      data: req.body
    })
    res.json({ success: true, data: articulo })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.put('/api/articulos/:id', async (req, res) => {
  try {
    const articulo = await prisma.articulo.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    })
    res.json({ success: true, data: articulo })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============ RUBROS ============

app.get('/api/rubros', async (req, res) => {
  try {
    const rubros = await prisma.rubro.findMany({
      orderBy: { codigo: 'asc' }
    })
    res.json({ success: true, data: rubros })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/rubros', async (req, res) => {
  try {
    const rubro = await prisma.rubro.create({ data: req.body })
    res.json({ success: true, data: rubro })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============ FORMAS DE PAGO ============

app.get('/api/formas-pago', async (req, res) => {
  try {
    const formas = await prisma.formaPago.findMany({
      orderBy: { codigo: 'asc' }
    })
    res.json({ success: true, data: formas })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============ FACTURAS ============

app.get('/api/facturas', async (req, res) => {
  try {
    const facturas = await prisma.factura.findMany({
      include: { cliente: true, items: true },
      orderBy: { fecha: 'desc' }
    })
    res.json({ success: true, data: facturas })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/facturas', async (req, res) => {
  try {
    const { items, ...factura } = req.body
    const result = await prisma.factura.create({
      data: {
        ...factura,
        items: {
          create: items
        }
      },
      include: { items: true }
    })
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`✓ API Server running on http://localhost:${PORT}`)
  console.log(`✓ PostgreSQL connected`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit()
})
