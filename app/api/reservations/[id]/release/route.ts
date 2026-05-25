import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id }
  })

  if (!reservation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (reservation.status !== 'pending') {
    return NextResponse.json({ error: 'Already processed' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: params.id },
      data: { status: 'released' }
    }),
    prisma.inventoryLevel.update({
      where: {
        productId_warehouseId: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId
        }
      },
      data: { reservedUnits: { decrement: reservation.quantity } }
    })
  ])

  return NextResponse.json({ success: true })
}