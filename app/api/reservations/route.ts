import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productId, warehouseId, quantity } = body

    const lockKey = `lock:${productId}:${warehouseId}`
    const lock = await redis.set(lockKey, '1', { nx: true, ex: 5 })

    if (!lock) {
      return NextResponse.json({ error: 'Try again' }, { status: 429 })
    }

    try {
      const inventory = await prisma.inventoryLevel.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } }
      })

      if (!inventory) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      const available = inventory.totalUnits - inventory.reservedUnits

      if (available < quantity) {
        return NextResponse.json({ error: 'Not enough stock' }, { status: 409 })
      }

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      const reservation = await prisma.reservation.create({
        data: { productId, warehouseId, quantity, expiresAt, status: 'pending' }
      })

      await prisma.inventoryLevel.update({
        where: { productId_warehouseId: { productId, warehouseId } },
        data: { reservedUnits: { increment: quantity } }
      })

      return NextResponse.json(reservation, { status: 201 })
    } finally {
      await redis.del(lockKey)
    }
  } catch (err) {
    console.error('Reservation error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}