import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      inventoryLevels: {
        include: { warehouse: true }
      }
    }
  })
  return NextResponse.json(products)
}