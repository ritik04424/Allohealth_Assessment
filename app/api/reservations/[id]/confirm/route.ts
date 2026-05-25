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

  if (new Date() > reservation.expiresAt) {
    await prisma.reservation.update({
      where: { id: params.id },
      data: { status: 'released' }
    })
    return NextResponse.json({ error: 'Reservation expired' }, { status: 410 })
  }

  const updated = await prisma.reservation.update({
    where: { id: params.id },
    data: { status: 'confirmed' }
  })

  return NextResponse.json(updated)
}